import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load server/.env first, fallback to root .env if present
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const mongoUrl = process.env.MONGO_URL;
const targetDbName = process.env.DB_NAME || 'WebReve_DB';
const targetCollectionName = process.env.COLLECTION_NAME || 'WebReve_DB';

async function main() {
  console.log('----------------------------------------------------');
  console.log('📦 WebReve MongoDB Collection Creator');
  console.log('----------------------------------------------------');

  if (!mongoUrl) {
    console.error('❌ Error: MONGO_URL is not defined in .env.');
    console.error('👉 Please make sure .env exists with a valid MONGO_URL.');
    process.exit(1);
  }

  if (mongoUrl.includes('<db_username>')) {
    console.error('⚠️  Attention: Your MONGO_URL in .env contains the placeholder "<db_username>".');
    console.error('');
    console.error('   Current URL:');
    console.error('   ' + mongoUrl);
    console.error('');
    console.error('👉 Action needed: Open .env and replace "<db_username>" with your');
    console.error('   actual MongoDB Atlas database user username.');
    console.error('   (MongoDB Atlas -> Security -> Database Access)');
    process.exit(1);
  }

  console.log('⏳ Connecting to MongoDB Atlas cluster...');
  const client = new MongoClient(mongoUrl, {
    serverSelectionTimeoutMS: 8000
  });

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas successfully.');

    const db = client.db(targetDbName);
    console.log(`📂 Database: "${targetDbName}"`);

    const existingCollections = await db.listCollections().toArray();
    const collectionNames = existingCollections.map(c => c.name);

    if (collectionNames.includes(targetCollectionName)) {
      console.log(`ℹ️ Collection "${targetCollectionName}" already exists.`);
    } else {
      await db.createCollection(targetCollectionName);
      console.log(`🎉 Collection "${targetCollectionName}" successfully created!`);
    }

    // List all collections in targetDbName
    const updatedCollections = await db.listCollections().toArray();
    console.log(`📋 Collections in "${targetDbName}":`, updatedCollections.map(c => c.name));
    console.log('✨ All done!');
  } catch (err) {
    console.error('❌ MongoDB Connection or Creation Error:', err.message);
    if (err.message.includes('Authentication failed') || err.message.includes('bad auth')) {
      console.error('👉 Please check your MongoDB username and password in .env.');
    }
  } finally {
    await client.close();
  }
}

main();
