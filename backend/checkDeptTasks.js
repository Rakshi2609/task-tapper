import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkTasks = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    const db = mongoose.connection.db;
    
    const deptId = '694b680cbd3bbccabd8a03bd';
    console.log(`🔍 Checking tasks for department: ${deptId}\n`);

    // Check normal tasks
    const tasks = await db.collection('teams').find({ 
      communityDept: new mongoose.Types.ObjectId(deptId) 
    }).toArray();
    
    console.log(`📋 Normal Tasks found: ${tasks.length}`);
    if (tasks.length > 0) {
      console.log('Tasks:', JSON.stringify(tasks, null, 2));
    }

    // Check recurring tasks
    const recurringTasks = await db.collection('recurringtasks').find({ 
      communityDept: new mongoose.Types.ObjectId(deptId) 
    }).toArray();
    
    console.log(`\n🔁 Recurring Tasks found: ${recurringTasks.length}`);
    if (recurringTasks.length > 0) {
      console.log('Recurring Tasks:', JSON.stringify(recurringTasks, null, 2));
    }

    // Check all tasks without filter
    const allTasks = await db.collection('teams').find({}).toArray();
    console.log(`\n📊 Total tasks in database: ${allTasks.length}`);

    const allRecurring = await db.collection('recurringtasks').find({}).toArray();
    console.log(`📊 Total recurring tasks in database: ${allRecurring.length}`);

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkTasks();
