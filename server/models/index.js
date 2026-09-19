// Centralized Models Export & Index Initializer
import { formatInquiryDoc, InquiryStatus } from './Inquiry.js';
import { formatMessageDoc, MessageType, MessageChannel } from './Message.js';
import { formatProjectDoc } from './Project.js';
import { formatAdminDoc } from './Admin.js';

export {
  formatInquiryDoc,
  InquiryStatus,
  formatMessageDoc,
  MessageType,
  MessageChannel,
  formatProjectDoc,
  formatAdminDoc
};

/**
 * Configure all MongoDB Atlas indexes for performance and data integrity
 */
export async function setupDatabaseIndexes(db) {
  if (!db) return;
  try {
    await db.collection('admins').createIndex({ email: 1 }, { unique: true });
    await db.collection('conversations').createIndex({ id: 1 }, { unique: true });
    await db.collection('conversations').createIndex({ email: 1 });
    await db.collection('conversations').createIndex({ status: 1 });
    await db.collection('conversations').createIndex({ lastMessageAt: -1 });
    await db.collection('messages').createIndex({ conversationId: 1 });
    await db.collection('messages').createIndex({ id: 1 }, { unique: true });
    await db.collection('inquiries').createIndex({ id: 1 }, { unique: true });
    await db.collection('projects').createIndex({ id: 1 }, { unique: true });
    await db.collection('projects').createIndex({ order: 1 });
    console.log('📑 MongoDB Atlas Model Indexes verified.');
  } catch (err) {
    console.warn('⚠️ Index setup warning:', err.message);
  }
}
