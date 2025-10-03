const mongoose = require('mongoose');
require('dotenv').config();

async function clearDuplicateIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Get the admins collection
    const adminsCollection = db.collection('admins');
    
    // List all indexes on admins collection
    const indexes = await adminsCollection.indexes();
    console.log('Current indexes on admins collection:', indexes);
    
    // Drop and recreate indexes to resolve duplicates
    console.log('Dropping all indexes except _id...');
    await adminsCollection.dropIndexes();
    
    console.log('Indexes cleared. Restart your application to recreate proper indexes.');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

clearDuplicateIndexes();