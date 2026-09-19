import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { projects as defaultProjects } from './src/data/projects.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const rawMongoUrl = process.env.MONGO_URL || '';
const JWT_SECRET = process.env.JWT_SECRET || 'webreve_secret_jwt_key_paris_ny_2026';

// Authorized Admin Emails
const ALLOWED_ADMIN_EMAILS = [
  'singh.aditya.44618@gmail.com',
  'aman27pvt@gmail.com'
];

// Enable JSON & CORS
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure Multer for in-memory upload buffering (up to 50MB per high-res image)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

let db = null;
let gridfsBucket = null;
let mongoClient = null;
let isConnected = false;
let connectionError = null;

// Local in-memory admin fallback stores (pure real data, no fake seeds)
const localAdminUsers = new Map();
const localConversations = new Map();
const localMessages = new Map();
const localProjects = new Map(defaultProjects.map((p, idx) => [p.id, { ...p, order: idx + 1 }]));

// Helper: Escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Helper: Normalize Email
function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

// -----------------------------------------------------------------------------
// ONE-TIME BACKFILL & CLEANUP MIGRATION
// -----------------------------------------------------------------------------
async function migrateAndBackfillConversations() {
  try {
    // 1. In MongoDB
    if (isConnected && db) {
      // Remove any legacy seeded sample threads (Alexandre Laurent, Sophia Chen, Liam O'Connor)
      await db.collection('conversations').deleteMany({
        id: { $in: ['conv-1', 'conv-2', 'conv-3'] }
      });
      await db.collection('messages').deleteMany({
        id: { $in: ['msg-1-1', 'msg-1-2', 'msg-2-1', 'msg-2-2', 'msg-2-3', 'msg-3-1', 'msg-3-2'] }
      });
      await db.collection('inquiries').deleteMany({
        id: { $in: ['inq-1', 'inq-2', 'inq-3'] }
      });

      // Find any inquiries that don't have a matching conversation yet
      const existingInquiries = await db.collection('inquiries').find({}).toArray();
      for (const inq of existingInquiries) {
        if (!inq.email) continue;
        const normalizedEmail = normalizeEmail(inq.email);
        const existingConv = await db.collection('conversations').findOne({
          $or: [{ email: normalizedEmail }, { id: inq.id.replace('inq-', 'conv-') }]
        });

        if (!existingConv) {
          const convId = inq.id ? inq.id.replace('inq-', 'conv-') : `conv-${Date.now()}`;
          const refCode = inq.reference || `WBR-2026-0001`;
          const convDoc = {
            id: convId,
            reference: refCode,
            name: inq.name || 'Aditya Singh',
            email: normalizedEmail,
            whatsapp: inq.whatsapp || '9741780612',
            plan: inq.plan || 'Dynamic Build',
            extraMonths: inq.extraMonths || 0,
            total: inq.total || inq.totalPrice || 10000,
            status: inq.status?.toLowerCase() === 'new' ? 'new' : (inq.status?.toLowerCase() || 'new'),
            unreadCount: 1,
            lastMessageAt: inq.createdAt || inq.date || new Date().toISOString(),
            createdAt: inq.createdAt || inq.date || new Date().toISOString()
          };

          await db.collection('conversations').insertOne(convDoc);

          const msgId = `msg-${Date.now()}`;
          await db.collection('messages').insertOne({
            id: msgId,
            conversationId: convId,
            type: 'inbound',
            channel: 'form',
            body: inq.message || 'Project inquiry submission.',
            createdAt: inq.createdAt || inq.date || new Date().toISOString(),
            readAt: null
          });

          console.log(`✨ Backfilled conversation for lead: ${inq.name} (${inq.email})`);
        }
      }
    }

    // 2. In Local Memory Store
    localConversations.delete('conv-1');
    localConversations.delete('conv-2');
    localConversations.delete('conv-3');
    localMessages.delete('msg-1-1');
    localMessages.delete('msg-1-2');
    localMessages.delete('msg-2-1');
    localMessages.delete('msg-2-2');
    localMessages.delete('msg-2-3');
    localMessages.delete('msg-3-1');
    localMessages.delete('msg-3-2');
  } catch (err) {
    console.warn('Migration warning:', err.message);
  }
}

// Initialize collections, unique indexes, and default admin accounts
async function initCollectionsAndIndexes() {
  try {
    if (isConnected && db) {
      await db.collection('admins').createIndex({ email: 1 }, { unique: true });
      await db.collection('conversations').createIndex({ id: 1 }, { unique: true });
      await db.collection('conversations').createIndex({ email: 1 });
      await db.collection('conversations').createIndex({ status: 1 });
      await db.collection('messages').createIndex({ conversationId: 1 });
      await db.collection('messages').createIndex({ id: 1 }, { unique: true });
      await db.collection('inquiries').createIndex({ id: 1 }, { unique: true });
      await db.collection('projects').createIndex({ id: 1 }, { unique: true });

      // Seed default projects into MongoDB if empty
      const existingProjectsCount = await db.collection('projects').countDocuments({ deletedAt: { $exists: false } });
      if (existingProjectsCount === 0) {
        const initialDocs = defaultProjects.map((p, idx) => ({
          ...p,
          order: idx + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        await db.collection('projects').insertMany(initialDocs);
        console.log(`📦 Seeded ${initialDocs.length} initial projects into MongoDB.`);
      }

      // Seed default admin accounts if missing
      for (const email of ALLOWED_ADMIN_EMAILS) {
        const existing = await db.collection('admins').findOne({ email });
        if (!existing) {
          const defaultPasswordHash = await bcrypt.hash('password123', 10);
          await db.collection('admins').insertOne({
            email,
            name: email.split('@')[0],
            role: 'admin',
            passwordHash: defaultPasswordHash,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          console.log(`👤 Initialized Admin Account in MongoDB: ${email}`);
        }
      }
    } else {
      // Local fallback in-memory store
      for (const email of ALLOWED_ADMIN_EMAILS) {
        if (!localAdminUsers.has(email)) {
          const defaultPasswordHash = await bcrypt.hash('password123', 10);
          localAdminUsers.set(email, {
            email,
            name: email.split('@')[0],
            role: 'admin',
            passwordHash: defaultPasswordHash,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
    }
  } catch (err) {
    console.warn('initCollectionsAndIndexes notice:', err.message);
  }
}

// Connect to MongoDB
async function ensureDbConnected() {
  if (isConnected && db) return db;
  const currentUrl = process.env.MONGO_URL || rawMongoUrl;
  if (!currentUrl) {
    connectionError = "MONGO_URL is missing in environment variables.";
    return null;
  }
  if (currentUrl.includes('<db_username>')) {
    connectionError = "MONGO_URL contains placeholder '<db_username>'. Please set database credentials in environment variables.";
    return null;
  }
  try {
    if (!mongoClient) {
      mongoClient = new MongoClient(currentUrl, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000
      });
    }
    await mongoClient.connect();
    db = mongoClient.db('webreve_db');
    gridfsBucket = new GridFSBucket(db, { bucketName: 'images' });
    isConnected = true;
    connectionError = null;
    await initCollectionsAndIndexes();
    return db;
  } catch (err) {
    isConnected = false;
    connectionError = err.message;
    console.error("❌ MongoDB connection error:", err.message);
    return null;
  }
}

async function connectDB() {
  await ensureDbConnected();
  if (isConnected) {
    console.log("✅ Successfully connected to MongoDB Atlas (WebReve Database & GridFS Bucket).");
    await migrateAndBackfillConversations();
  }
}

connectDB();

// Ensure DB is connected in all environments (Vercel Serverless / Render Web Service)
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) {
    if (!isConnected || !db) {
      await ensureDbConnected();
    }
  }
  next();
});

// -----------------------------------------------------------------------------
// SERVER-SIDE AUTHENTICATION MIDDLEWARE
// -----------------------------------------------------------------------------
function authenticateAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Admin authentication token is required.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!ALLOWED_ADMIN_EMAILS.includes(normalizeEmail(decoded.email))) {
      return res.status(403).json({ error: 'Forbidden: You do not have administrator permissions.' });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session token.', details: err.message });
  }
}

// -----------------------------------------------------------------------------
// RESEND EMAIL HELPER
// -----------------------------------------------------------------------------
async function sendEmailViaResend({ to, subject, text, html, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ RESEND_API_KEY is not configured in .env. Outbound email simulated.");
    return { success: true, simulated: true };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'WebRêve Studio <hello@webreve.design>';
  const fallbackReplyTo = process.env.ADMIN_REPLY_TO || 'singh.aditya.44618@gmail.com';

  const bodyHtml = html || `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.6; color: #1A1512; background-color: #F0EBE1; padding: 28px; border-radius: 4px;">
      <div style="max-width: 580px; margin: 0 auto; background: #FFFFFF; padding: 24px; border: 1px solid #1A1512; border-radius: 4px;">
        <div style="font-weight: 800; font-size: 18px; letter-spacing: -0.5px; margin-bottom: 16px; color: #1A1512;">WEBREVE STUDIO</div>
        <div style="white-space: pre-wrap; margin-bottom: 20px;">${escapeHtml(text)}</div>
        <hr style="border: none; border-top: 1px solid #E8E2D7; margin: 20px 0;" />
        <div style="font-size: 12px; color: #888888; font-family: monospace;">Websites worth dreaming about. • Remote Worldwide</div>
      </div>
    </div>
  `;

  const payload = {
    from: fromEmail,
    to: Array.isArray(to) ? to : [to],
    reply_to: replyTo || fallbackReplyTo,
    subject: subject || 'Message from WebRêve Studio',
    text: text || '',
    html: bodyHtml
  };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMsg = data.message || (data.errors && data.errors[0]?.message) || `Resend dispatch failed (${response.status})`;
    throw new Error(errorMsg);
  }

  return { success: true, data };
}

// -----------------------------------------------------------------------------
// AUTHENTICATION ROUTES (Protected for 2 Authorized Emails)
// -----------------------------------------------------------------------------

// 1. Check Email Authorization
app.post('/api/auth/check-email', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email) {
      return res.status(400).json({ allowed: false, error: 'Please provide an email address.' });
    }

    if (!ALLOWED_ADMIN_EMAILS.includes(email)) {
      return res.status(403).json({
        allowed: false,
        error: `Access Denied: "${email}" is not authorized for the WebRêve Admin Suite.`
      });
    }

    let hasPassword = false;
    if (isConnected && db) {
      const adminDoc = await db.collection('admins').findOne({ email });
      if (adminDoc && adminDoc.passwordHash) {
        hasPassword = true;
      }
    } else {
      if (localAdminUsers.has(email) && localAdminUsers.get(email).passwordHash) {
        hasPassword = true;
      }
    }

    return res.json({
      allowed: true,
      email,
      hasPassword,
      isFirstTime: !hasPassword
    });
  } catch (err) {
    console.error('check-email error:', err);
    res.status(500).json({ error: 'Internal server error while checking email authorization.' });
  }
});

// 2. First-time Setup: Set Password & Hash in MongoDB
app.post('/api/auth/set-password', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (!ALLOWED_ADMIN_EMAILS.includes(email)) {
      return res.status(403).json({ error: 'Unauthorized email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    if (isConnected && db) {
      await db.collection('admins').updateOne(
        { email },
        {
          $set: {
            email,
            passwordHash,
            updatedAt: new Date()
          },
          $setOnInsert: {
            createdAt: new Date()
          }
        },
        { upsert: true }
      );
      console.log(`🔐 Admin password set and hashed in MongoDB for: ${email}`);
    } else {
      localAdminUsers.set(email, { email, passwordHash, createdAt: new Date() });
      console.log(`🔐 Admin password set (Local fallback buffer) for: ${email}`);
    }

    const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      email,
      message: 'Password created and securely hashed in MongoDB.'
    });
  } catch (err) {
    console.error('set-password error:', err);
    res.status(500).json({ error: 'Failed to set password in database.', details: err.message });
  }
});

// 3. Reset Admin Credentials back to First-Time State
app.post('/api/auth/reset-credentials', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!ALLOWED_ADMIN_EMAILS.includes(email)) {
      return res.status(403).json({ error: 'Unauthorized email.' });
    }

    if (isConnected && db) {
      await db.collection('admins').deleteOne({ email });
    }
    localAdminUsers.delete(email);

    console.log(`🔄 Admin credentials reset to first-time setup for: ${email}`);
    res.json({ success: true, message: 'Admin credentials reset to first-time setup.' });
  } catch (_err) {
    res.status(500).json({ error: 'Failed to reset credentials.' });
  }
});

// 4. Login: Verify Password Hash in MongoDB
app.post('/api/auth/login', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (!ALLOWED_ADMIN_EMAILS.includes(email)) {
      return res.status(403).json({ error: 'Access Denied: Unauthorized admin email.' });
    }

    let userDoc = null;
    if (isConnected && db) {
      userDoc = await db.collection('admins').findOne({ email });
    } else {
      userDoc = localAdminUsers.get(email);
    }

    if (!userDoc || !userDoc.passwordHash) {
      return res.status(400).json({
        error: 'No password found for this email. Please complete first-time password setup.',
        isFirstTime: true
      });
    }

    const isValid = await bcrypt.compare(password, userDoc.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password. Please verify your credentials and try again.' });
    }

    const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    console.log(`🔓 Admin successfully authenticated: ${email}`);

    res.json({
      success: true,
      token,
      email
    });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ error: 'Login authentication error.', details: err.message });
  }
});

// 5. Verify Active Session
app.get('/api/auth/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ authenticated: false, error: 'Missing authorization token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!ALLOWED_ADMIN_EMAILS.includes(normalizeEmail(decoded.email))) {
      return res.status(403).json({ authenticated: false, error: 'User is not an authorized admin.' });
    }

    res.json({
      authenticated: true,
      email: decoded.email
    });
  } catch (_err) {
    res.status(401).json({ authenticated: false, error: 'Session expired or invalid.' });
  }
});

// 6. Change / Reset Password
app.post('/api/auth/change-password', authenticateAdmin, async (req, res) => {
  try {
    const email = req.admin.email;
    const { oldPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    let userDoc = null;
    if (isConnected && db) {
      userDoc = await db.collection('admins').findOne({ email });
    } else {
      userDoc = localAdminUsers.get(email);
    }

    if (userDoc && userDoc.passwordHash) {
      const isMatch = await bcrypt.compare(oldPassword, userDoc.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect.' });
      }
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    if (isConnected && db) {
      await db.collection('admins').updateOne(
        { email },
        { $set: { passwordHash: newHash, updatedAt: new Date() } }
      );
    } else {
      localAdminUsers.set(email, { email, passwordHash: newHash, updatedAt: new Date() });
    }

    res.json({ success: true, message: 'Password updated and hashed in MongoDB.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update password.', details: err.message });
  }
});

// -----------------------------------------------------------------------------
// PUBLIC LEAD INGESTION (CONTACT FORM) - ATOMIC CONVERSATION CREATION
// -----------------------------------------------------------------------------
app.post('/api/inquiries', async (req, res) => {
  try {
    const { name, email, whatsapp, message, plan, extraMonths, totalPrice, budget, projectType } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const normalizedClientEmail = normalizeEmail(email);
    const nowIso = new Date().toISOString();

    // 1. Calculate Reference Code
    let totalExisting = 0;
    if (isConnected && db) {
      totalExisting = await db.collection('conversations').countDocuments();
    } else {
      totalExisting = localConversations.size;
    }
    const referenceCode = `WBR-2026-${String(totalExisting + 1).padStart(4, '0')}`;

    // 2. Check if a conversation already exists for this client email
    let existingConv = null;
    if (isConnected && db) {
      existingConv = await db.collection('conversations').findOne({
        email: normalizedClientEmail,
        deletedAt: { $exists: false }
      });
    } else {
      existingConv = Array.from(localConversations.values()).find(
        (c) => normalizeEmail(c.email) === normalizedClientEmail && !c.deletedAt
      );
    }

    const conversationId = existingConv ? existingConv.id : `conv-${Date.now()}`;
    const unreadCount = (existingConv?.unreadCount || 0) + 1;

    const conversationDoc = {
      id: conversationId,
      reference: existingConv?.reference || referenceCode,
      name: name.trim(),
      email: normalizedClientEmail,
      whatsapp: (whatsapp || existingConv?.whatsapp || '').trim(),
      plan: plan || existingConv?.plan || 'Dynamic Build',
      extraMonths: extraMonths !== undefined ? Number(extraMonths) : (existingConv?.extraMonths || 0),
      total: totalPrice !== undefined ? Number(totalPrice) : (existingConv?.total || 10000),
      status: 'new', // New contact form submissions are created with status "new"
      unreadCount: unreadCount,
      lastMessageAt: nowIso,
      createdAt: existingConv?.createdAt || nowIso
    };

    // 3. Create First Inbound Message
    const messageId = `msg-${Date.now()}`;
    const messageDoc = {
      id: messageId,
      conversationId: conversationId,
      type: 'inbound',
      channel: 'form',
      body: (message || 'New contact inquiry submitted.').trim(),
      createdAt: nowIso,
      readAt: null
    };

    // 4. Save Conversation and Message in One Server Operation
    if (isConnected && db) {
      await db.collection('conversations').updateOne(
        { id: conversationId },
        { $set: conversationDoc },
        { upsert: true }
      );
      await db.collection('messages').insertOne({ ...messageDoc, _id: messageId });
      
      // Also sync to inquiries collection for backwards compatibility
      await db.collection('inquiries').updateOne(
        { id: `inq-${conversationId.replace('conv-', '')}` },
        {
          $set: {
            ...conversationDoc,
            id: `inq-${conversationId.replace('conv-', '')}`,
            message: messageDoc.body
          }
        },
        { upsert: true }
      );
    } else {
      localConversations.set(conversationId, conversationDoc);
      localMessages.set(messageId, messageDoc);
    }

    console.log(`📩 Lead Ingested [${conversationDoc.reference}]: ${name} (${email}) -> Status: NEW`);

    return res.json({
      success: true,
      conversationId,
      reference: conversationDoc.reference,
      conversation: conversationDoc,
      message: 'Inquiry received and conversation created.'
    });
  } catch (err) {
    console.error('Error saving inquiry:', err);
    res.status(500).json({ error: 'Failed to process inquiry submission.', details: err.message });
  }
});

// -----------------------------------------------------------------------------
// CONVERSATIONS & MESSAGES API (SERVER-PROTECTED SINGLE SOURCE OF TRUTH)
// -----------------------------------------------------------------------------

// 1. List Conversations (Single Source of Truth)
app.get('/api/admin/conversations', authenticateAdmin, async (req, res) => {
  try {
    const { status, q } = req.query;

    let convList = [];
    if (isConnected && db) {
      const query = { deletedAt: { $exists: false } };
      if (status && status !== 'all') {
        if (status === 'closed') {
          query.status = { $in: ['won', 'lost'] };
        } else {
          query.status = status;
        }
      }
      convList = await db.collection('conversations').find(query).sort({ lastMessageAt: -1 }).toArray();
    } else {
      convList = Array.from(localConversations.values()).filter((c) => !c.deletedAt);
      if (status && status !== 'all') {
        if (status === 'closed') {
          convList = convList.filter((c) => c.status === 'won' || c.status === 'lost');
        } else {
          convList = convList.filter((c) => c.status === status);
        }
      }
      convList.sort((a, b) => new Date(b.lastMessageAt || b.createdAt) - new Date(a.lastMessageAt || a.createdAt));
    }

    // Attach latest message preview for each conversation
    const enhancedConversations = await Promise.all(
      convList.map(async (conv) => {
        let lastMsg = null;
        if (isConnected && db) {
          lastMsg = await db.collection('messages')
            .find({ conversationId: conv.id, deletedAt: { $exists: false } })
            .sort({ createdAt: -1 })
            .limit(1)
            .toArray();
          lastMsg = lastMsg[0] || null;
        } else {
          const msgs = Array.from(localMessages.values())
            .filter((m) => m.conversationId === conv.id && !m.deletedAt)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          lastMsg = msgs[0] || null;
        }

        return {
          ...conv,
          preview: lastMsg ? lastMsg.body : (conv.preview || 'No messages yet.'),
          lastMessageType: lastMsg ? lastMsg.type : null
        };
      })
    );

    // Filter by search query if provided
    let results = enhancedConversations;
    if (q && q.trim()) {
      const queryLower = q.trim().toLowerCase();
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(queryLower) ||
          c.email.toLowerCase().includes(queryLower) ||
          (c.whatsapp && c.whatsapp.toLowerCase().includes(queryLower)) ||
          (c.plan && c.plan.toLowerCase().includes(queryLower)) ||
          (c.preview && c.preview.toLowerCase().includes(queryLower))
      );
    }

    res.json({
      success: true,
      conversations: results,
      totalCount: results.length
    });
  } catch (err) {
    console.error('List conversations error:', err);
    res.status(500).json({ error: 'Failed to retrieve conversations.', details: err.message });
  }
});

// 2. Get Single Conversation + Messages (and mark as read)
app.get('/api/admin/conversations/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    let conv = null;
    let messages = [];

    if (isConnected && db) {
      conv = await db.collection('conversations').findOne({ id, deletedAt: { $exists: false } });
      if (!conv) {
        return res.status(404).json({ error: 'Conversation not found.' });
      }

      messages = await db.collection('messages')
        .find({ conversationId: id, deletedAt: { $exists: false } })
        .sort({ createdAt: 1 })
        .toArray();

      // Mark all unread messages as read
      await db.collection('messages').updateMany(
        { conversationId: id, readAt: null },
        { $set: { readAt: new Date().toISOString() } }
      );

      // Reset conversation unreadCount to 0
      await db.collection('conversations').updateOne(
        { id },
        { $set: { unreadCount: 0 } }
      );
      conv.unreadCount = 0;
    } else {
      conv = localConversations.get(id);
      if (!conv || conv.deletedAt) {
        return res.status(404).json({ error: 'Conversation not found.' });
      }

      messages = Array.from(localMessages.values())
        .filter((m) => m.conversationId === id && !m.deletedAt)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      messages.forEach((m) => {
        if (!m.readAt) m.readAt = new Date().toISOString();
      });
      conv.unreadCount = 0;
      localConversations.set(id, conv);
    }

    res.json({
      success: true,
      conversation: conv,
      messages: messages
    });
  } catch (err) {
    console.error('Get conversation details error:', err);
    res.status(500).json({ error: 'Failed to load conversation thread.', details: err.message });
  }
});

// 3. Post Message to Thread (Outbound Email, Note, or Inbound Client Message)
app.post('/api/admin/conversations/:id/messages', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, channel, body, subject } = req.body;

    if (!body || !body.trim()) {
      return res.status(400).json({ error: 'Message body cannot be empty.' });
    }

    let conv = null;
    if (isConnected && db) {
      conv = await db.collection('conversations').findOne({ id, deletedAt: { $exists: false } });
    } else {
      conv = localConversations.get(id);
    }

    if (!conv || conv.deletedAt) {
      return res.status(404).json({ error: 'Conversation does not exist.' });
    }

    // If outbound email, dispatch through Resend before saving
    if (type === 'outbound' && channel === 'email') {
      try {
        await sendEmailViaResend({
          to: conv.email,
          subject: subject || `Regarding your WebRêve Project Inquiry (${conv.plan || 'Custom Design'})`,
          text: body.trim()
        });
        console.log(`✉️ Outbound Email dispatched via Resend to ${conv.email}`);
      } catch (emailErr) {
        console.error('Resend dispatch failure:', emailErr.message);
        return res.status(502).json({
          error: `Email sending failed: ${emailErr.message}. Your draft has been preserved.`,
          details: emailErr.message
        });
      }
    }

    const messageId = `msg-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const newMsg = {
      id: messageId,
      conversationId: id,
      type: type || 'outbound',
      channel: channel || 'email',
      body: body.trim(),
      createdAt: nowIso,
      readAt: nowIso
    };

    // Determine new conversation status
    let updatedStatus = conv.status;
    if (type === 'outbound') {
      updatedStatus = 'active'; // Sending a reply sets status to "active"
    } else if (type === 'inbound') {
      updatedStatus = 'awaiting_reply'; // A new inbound message sets status to "awaiting_reply"
    }

    const updatedConvFields = {
      lastMessageAt: nowIso,
      status: updatedStatus,
      unreadCount: type === 'inbound' ? (conv.unreadCount || 0) + 1 : 0
    };

    if (isConnected && db) {
      await db.collection('messages').insertOne({ ...newMsg, _id: messageId });
      await db.collection('conversations').updateOne(
        { id },
        { $set: updatedConvFields }
      );
    } else {
      localMessages.set(messageId, newMsg);
      localConversations.set(id, { ...conv, ...updatedConvFields });
    }

    res.json({
      success: true,
      message: newMsg,
      conversation: { ...conv, ...updatedConvFields }
    });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Failed to post message to conversation.', details: err.message });
  }
});

// 4. Update Conversation Status (Shared between Leads & Conversations)
app.patch('/api/admin/conversations/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['new', 'awaiting_reply', 'active', 'won', 'lost'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    let updatedConv = null;
    const nowIso = new Date().toISOString();

    if (isConnected && db) {
      await db.collection('conversations').updateOne(
        { id },
        { $set: { status, updatedAt: nowIso } }
      );
      updatedConv = await db.collection('conversations').findOne({ id });
    } else {
      const conv = localConversations.get(id);
      if (!conv || conv.deletedAt) {
        return res.status(404).json({ error: 'Conversation not found.' });
      }
      updatedConv = { ...conv, status, updatedAt: nowIso };
      localConversations.set(id, updatedConv);
    }

    res.json({
      success: true,
      conversation: updatedConv
    });
  } catch (err) {
    console.error('Update conversation status error:', err);
    res.status(500).json({ error: 'Failed to update conversation status.', details: err.message });
  }
});

// 5. Delete Conversation / Lead (Permanent removal from all collections)
app.delete('/api/admin/conversations/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const possibleIds = [
      String(id),
      String(id).replace('inq-', 'conv-'),
      String(id).replace('conv-', 'inq-')
    ];

    if (isConnected && db) {
      await db.collection('conversations').deleteMany({
        $or: [
          { id: { $in: possibleIds } },
          { _id: id }
        ]
      });
      await db.collection('messages').deleteMany({
        conversationId: { $in: possibleIds }
      });
      await db.collection('inquiries').deleteMany({
        $or: [
          { id: { $in: possibleIds } },
          { _id: id }
        ]
      });
    }

    // Also remove from local in-memory fallback store
    possibleIds.forEach((pid) => {
      localConversations.delete(pid);
    });
    for (const [msgId, msg] of localMessages.entries()) {
      if (possibleIds.includes(msg.conversationId)) {
        localMessages.delete(msgId);
      }
    }

    console.log(`🗑️ Conversation permanently deleted: ${id}`);
    res.json({ success: true, message: 'Conversation deleted successfully.' });
  } catch (err) {
    console.error('Delete conversation error:', err);
    res.status(500).json({ error: 'Failed to delete conversation.', details: err.message });
  }
});

// Also support DELETE /api/inquiries/:id
app.delete('/api/inquiries/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const possibleIds = [
      String(id),
      String(id).replace('inq-', 'conv-'),
      String(id).replace('conv-', 'inq-')
    ];

    if (isConnected && db) {
      await db.collection('conversations').deleteMany({
        $or: [
          { id: { $in: possibleIds } },
          { _id: id }
        ]
      });
      await db.collection('messages').deleteMany({
        conversationId: { $in: possibleIds }
      });
      await db.collection('inquiries').deleteMany({
        $or: [
          { id: { $in: possibleIds } },
          { _id: id }
        ]
      });
    }

    possibleIds.forEach((pid) => {
      localConversations.delete(pid);
    });
    for (const [msgId, msg] of localMessages.entries()) {
      if (possibleIds.includes(msg.conversationId)) {
        localMessages.delete(msgId);
      }
    }

    res.json({ success: true, message: 'Inquiry deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete inquiry.', details: err.message });
  }
});

// 6. Real Admin KPI Stats (Calculated strictly from real conversations)
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    let convList = [];
    if (isConnected && db) {
      convList = await db.collection('conversations').find({ deletedAt: { $exists: false } }).toArray();
    } else {
      convList = Array.from(localConversations.values()).filter((c) => !c.deletedAt);
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const newLeads = convList.filter((c) => c.status === 'new').length;
    const awaitingReply = convList.filter((c) => c.status === 'awaiting_reply').length;
    const activeConversations = convList.filter((c) => c.status === 'active').length;
    
    // Won conversations this month
    const wonThisMonthList = convList.filter((c) => {
      if (c.status !== 'won') return false;
      const cDate = new Date(c.updatedAt || c.lastMessageAt || c.createdAt);
      return cDate.getFullYear() === currentYear && cDate.getMonth() === currentMonth;
    });

    const wonThisMonthCount = wonThisMonthList.length;
    const wonRevenue = wonThisMonthList.reduce((acc, c) => acc + (Number(c.total) || 0), 0);
    
    // Total unread: sum of conversations requiring action
    const totalUnread = convList.reduce((acc, c) => {
      const count = Number(c.unreadCount) || 0;
      if (count > 0 || c.status === 'new' || c.status === 'awaiting_reply') {
        return acc + (count > 0 ? count : 1);
      }
      return acc;
    }, 0);

    res.json({
      success: true,
      stats: {
        newLeads,
        awaitingReply,
        activeConversations,
        wonThisMonthCount,
        wonRevenue,
        totalUnread,
        totalConversations: convList.length
      }
    });
  } catch (err) {
    console.error('Admin stats calculation error:', err);
    res.status(500).json({ error: 'Failed to compute admin statistics.', details: err.message });
  }
});

// Diagnostic endpoint: Collections status and counts
app.get('/api/admin/collections-status', authenticateAdmin, async (req, res) => {
  try {
    let adminsCount = 0;
    let conversationsCount = 0;
    let messagesCount = 0;
    let inquiriesCount = 0;
    let projectsCount = 0;
    let testimonialsCount = 0;

    if (isConnected && db) {
      adminsCount = await db.collection('admins').countDocuments();
      conversationsCount = await db.collection('conversations').countDocuments({ deletedAt: { $exists: false } });
      messagesCount = await db.collection('messages').countDocuments({ deletedAt: { $exists: false } });
      inquiriesCount = await db.collection('inquiries').countDocuments();
      projectsCount = await db.collection('projects').countDocuments();
      testimonialsCount = await db.collection('testimonials').countDocuments();
    } else {
      adminsCount = localAdminUsers.size;
      conversationsCount = Array.from(localConversations.values()).filter((c) => !c.deletedAt).length;
      messagesCount = Array.from(localMessages.values()).filter((m) => !m.deletedAt).length;
      inquiriesCount = conversationsCount;
    }

    res.json({
      success: true,
      storageType: isConnected ? 'MongoDB Atlas (webreve_db)' : 'In-Memory Secured Local Store',
      collections: {
        admins: { count: adminsCount, description: 'Admin accounts and credentials' },
        conversations: { count: conversationsCount, description: 'All client inquiries, terms, totals, and statuses' },
        messages: { count: messagesCount, description: 'All message threads and notes' },
        inquiries: { count: inquiriesCount, description: 'Synchronized inquiry records' },
        projects: { count: projectsCount, description: 'Case studies and portfolio items' },
        testimonials: { count: testimonialsCount, description: 'Client reviews and testimonials' }
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch collections status.', details: err.message });
  }
});

// Check API & MongoDB Status
app.get('/api/status', async (req, res) => {
  await ensureDbConnected();
  const currentUrl = process.env.MONGO_URL || rawMongoUrl;
  res.json({
    connected: isConnected,
    database: isConnected ? 'webreve_db' : null,
    gridfsReady: !!gridfsBucket,
    error: connectionError,
    mongoUrlConfigured: !!currentUrl,
    hasPlaceholder: currentUrl ? currentUrl.includes('<db_username>') : false,
    allowedEmails: ALLOWED_ADMIN_EMAILS,
    resendConfigured: !!process.env.RESEND_API_KEY
  });
});

// High-Quality Image Upload Endpoint (via MongoDB GridFS)
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided in request." });
    }

    const { originalname, mimetype, buffer, size } = req.file;

    if (isConnected && gridfsBucket) {
      const filename = `${Date.now()}-${originalname.replace(/\s+/g, '_')}`;
      
      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);

      const uploadStream = gridfsBucket.openUploadStream(filename, {
        contentType: mimetype,
        metadata: {
          originalName: originalname,
          uploadDate: new Date(),
          size: size
        }
      });

      readableStream.pipe(uploadStream)
        .on('error', (err) => {
          console.error("GridFS Upload Error:", err);
          return res.status(500).json({ error: "Failed to store image in MongoDB GridFS", details: err.message });
        })
        .on('finish', () => {
          const fileId = uploadStream.id.toString();
          const imageUrl = `/api/images/${fileId}`;
          console.log(`📸 Image stored in MongoDB GridFS: ${filename} (ID: ${fileId}, ${size} bytes)`);
          return res.json({
            success: true,
            storage: 'mongodb_gridfs',
            id: fileId,
            url: imageUrl,
            filename: filename,
            contentType: mimetype,
            size: size
          });
        });
    } else {
      const base64Data = `data:${mimetype};base64,${buffer.toString('base64')}`;
      return res.json({
        success: true,
        storage: 'base64_fallback',
        warning: connectionError || "MongoDB offline. Stored as high-resolution base64.",
        url: base64Data,
        filename: originalname,
        contentType: mimetype,
        size: size
      });
    }
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Internal server error during upload", details: error.message });
  }
});

// Serve Image by ID from MongoDB GridFS
app.get('/api/images/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isConnected || !gridfsBucket) {
      return res.status(503).json({ error: "MongoDB GridFS service is unavailable" });
    }

    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return res.status(400).json({ error: "Invalid image ID format" });
    }

    const files = await gridfsBucket.find({ _id: objectId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ error: "Image not found in MongoDB GridFS" });
    }

    const fileMeta = files[0];

    res.setHeader('Content-Type', fileMeta.contentType || 'image/jpeg');
    res.setHeader('Content-Length', fileMeta.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    const downloadStream = gridfsBucket.openDownloadStream(objectId);
    downloadStream.pipe(res);
  } catch (error) {
    console.error("Error retrieving image from GridFS:", error);
    res.status(500).json({ error: "Failed to fetch image from database", details: error.message });
  }
});

// -----------------------------------------------------------------------------
// PROJECTS API (MongoDB Powered)
// -----------------------------------------------------------------------------

// 1. Get All Projects (Public)
app.get('/api/projects', async (req, res) => {
  try {
    if (isConnected && db) {
      const projectsList = await db.collection('projects')
        .find({ deletedAt: { $exists: false } })
        .sort({ order: 1, createdAt: 1 })
        .toArray();
      return res.json({ success: true, projects: projectsList });
    } else {
      const list = Array.from(localProjects.values()).filter((p) => !p.deletedAt);
      return res.json({ success: true, projects: list.length > 0 ? list : defaultProjects });
    }
  } catch (err) {
    console.error('Fetch projects error:', err);
    res.status(500).json({ error: 'Failed to fetch projects.', details: err.message });
  }
});

// 2. Get Single Project by ID (Public)
app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isConnected && db) {
      const project = await db.collection('projects').findOne({
        id,
        deletedAt: { $exists: false }
      });
      if (project) {
        return res.json({ success: true, project });
      }
      return res.status(404).json({ error: 'Project not found.' });
    } else {
      const match = localProjects.get(id) || defaultProjects.find((p) => p.id === id);
      if (match && !match.deletedAt) return res.json({ success: true, project: match });
      return res.status(404).json({ error: 'Project not found.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch project.', details: err.message });
  }
});

// 3. Create Project (Admin Protected)
const handleCreateProject = async (req, res) => {
  try {
    await ensureDbConnected();
    const projectData = req.body;
    const projectId = projectData.id || `proj-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newProject = {
      ...projectData,
      id: projectId,
      createdAt: projectData.createdAt || nowIso,
      updatedAt: nowIso
    };

    if (isConnected && db) {
      await db.collection('projects').updateOne(
        { id: projectId },
        { $set: newProject },
        { upsert: true }
      );
      console.log(`✨ Saved project to MongoDB: ${newProject.title} (${projectId})`);
    } else {
      console.warn(`⚠️ Cannot save project to MongoDB (isConnected: ${isConnected}, db: ${!!db})`);
    }
    localProjects.set(projectId, newProject);

    res.json({ success: true, project: newProject, savedToMongo: isConnected && !!db });
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ error: 'Failed to create project.', details: err.message });
  }
};
app.post('/api/admin/projects', authenticateAdmin, handleCreateProject);
app.post('/api/projects', authenticateAdmin, handleCreateProject);

// 4. Update Project (Admin Protected - with Upsert)
const handleUpdateProject = async (req, res) => {
  try {
    await ensureDbConnected();
    const { id } = req.params;
    const updatedFields = req.body;
    const nowIso = new Date().toISOString();

    if (isConnected && db) {
      await db.collection('projects').updateOne(
        { id },
        { 
          $set: { ...updatedFields, id, updatedAt: nowIso },
          $setOnInsert: { createdAt: nowIso }
        },
        { upsert: true }
      );
      console.log(`📝 Upserted project in MongoDB: ${id}`);
    } else {
      console.warn(`⚠️ Cannot update project in MongoDB (isConnected: ${isConnected}, db: ${!!db})`);
    }
    const current = localProjects.get(id) || {};
    localProjects.set(id, { ...current, ...updatedFields, id, updatedAt: nowIso });

    res.json({ success: true, message: 'Project updated successfully.', savedToMongo: isConnected && !!db });
  } catch (err) {
    console.error('Update project error:', err);
    res.status(500).json({ error: 'Failed to update project.', details: err.message });
  }
};
app.put('/api/admin/projects/:id', authenticateAdmin, handleUpdateProject);
app.put('/api/projects/:id', authenticateAdmin, handleUpdateProject);

// 5. Batch Sync Projects to MongoDB (Admin Protected)
app.post('/api/admin/projects/sync', authenticateAdmin, async (req, res) => {
  try {
    await ensureDbConnected();
    const { projects: incomingProjects } = req.body;
    if (!Array.isArray(incomingProjects) || incomingProjects.length === 0) {
      return res.status(400).json({ error: 'No projects array provided.' });
    }

    if (isConnected && db) {
      for (const p of incomingProjects) {
        if (!p.id) continue;
        const nowIso = new Date().toISOString();
        await db.collection('projects').updateOne(
          { id: p.id },
          { 
            $set: { ...p, updatedAt: nowIso },
            $setOnInsert: { createdAt: p.createdAt || nowIso }
          },
          { upsert: true }
        );
      }
      console.log(`🔄 Synced ${incomingProjects.length} projects to MongoDB.`);
      return res.json({ success: true, count: incomingProjects.length, savedToMongo: true });
    } else {
      return res.status(503).json({ error: 'MongoDB is not connected.', savedToMongo: false });
    }
  } catch (err) {
    console.error('Projects sync error:', err);
    res.status(500).json({ error: 'Failed to sync projects.', details: err.message });
  }
});

// 6. Delete Project (Admin Protected)
const handleDeleteProject = async (req, res) => {
  try {
    await ensureDbConnected();
    const { id } = req.params;
    if (isConnected && db) {
      await db.collection('projects').deleteOne({ id });
    }
    localProjects.delete(id);

    console.log(`🗑️ Permanently deleted project from MongoDB: ${id}`);
    res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (err) {
    console.error('Delete project error:', err);
    res.status(500).json({ error: 'Failed to delete project.', details: err.message });
  }
};
app.delete('/api/admin/projects/:id', authenticateAdmin, handleDeleteProject);
app.delete('/api/projects/:id', authenticateAdmin, handleDeleteProject);

// -----------------------------------------------------------------------------
// SERVE STATIC PRODUCTION FRONTEND (Vite dist/ & SPA Routing)
// -----------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');

app.use(express.static(distPath));

// Catch-all route to serve index.html for React Router client-side routes (/admin, /work/1, etc.)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    const indexPath = path.join(distPath, 'index.html');
    return res.sendFile(indexPath, (err) => {
      if (err) {
        res.status(404).send('WebRêve: Frontend bundle not found. Please run "npm run build".');
      }
    });
  }
  next();
});

// Start Server (only if not running inside a serverless handler or imported by Vercel)
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 WebRêve MongoDB & API Server running on http://localhost:${PORT}`);
  });
}

export default app;
