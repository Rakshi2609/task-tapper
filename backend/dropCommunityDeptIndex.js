import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dropIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('communitydepts');

    // Drop the problematic unique index on CreatedBy
    try {
      await collection.dropIndex('CreatedBy_1');
      console.log('✅ Successfully dropped CreatedBy_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('Index CreatedBy_1 does not exist (already dropped)');
      } else {
        throw error;
      }
    }

    // Drop the unique index on name (should only be unique per community)
    try {
      await collection.dropIndex('name_1');
      console.log('✅ Successfully dropped name_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('Index name_1 does not exist (already dropped)');
      } else {
        throw error;
      }
    }

    // List remaining indexes
    const indexes = await collection.indexes();
    console.log('\nRemaining indexes:');
    console.log(JSON.stringify(indexes, null, 2));

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

dropIndex();
