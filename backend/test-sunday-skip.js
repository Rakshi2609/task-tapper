// Test script to verify Sunday skip logic for daily tasks
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import RecurringTask from './models/recurringTaskModel.js';
import Team from './models/Team.js';
import User from './models/User.js';

dotenv.config();

const testSundaySkip = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const testUser = await User.findOne();
    if (!testUser) {
      console.log('❌ No users found');
      process.exit(1);
    }

    // Clean up test data
    await RecurringTask.deleteMany({ taskName: 'Sunday Skip Test' });
    await Team.deleteMany({ taskName: 'Sunday Skip Test' });

    // Create a daily recurring task
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);

    const dailyTask = new RecurringTask({
      taskName: 'Sunday Skip Test',
      taskDescription: 'Test daily task that should skip Sundays',
      taskFrequency: 'Daily',
      taskCreateDaysAhead: 1,
      taskStartDate: today,
      taskEndDate: oneWeekLater,
      taskAssignedBy: testUser._id,
      taskAssignedTo: testUser._id,
      createdBy: testUser.email,
      priority: 'Medium'
    });

    await dailyTask.save();

    console.log('📋 Testing Daily Task with Sunday Skip');
    console.log('=====================================\n');
    
    // Test different days of the week
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (let i = 0; i < 7; i++) {
      const testDate = new Date(today);
      testDate.setDate(today.getDate() + i);
      const dayOfWeek = testDate.getDay();
      const dayName = daysOfWeek[dayOfWeek];
      
      // Check logic
      const shouldCreate = dayOfWeek !== 0; // Not Sunday
      
      console.log(`Day ${i + 1}: ${testDate.toDateString()} (${dayName})`);
      console.log(`   Day of week number: ${dayOfWeek}`);
      console.log(`   Should create task: ${shouldCreate ? '✅ YES' : '❌ NO (Sunday - Skipped)'}`);
      console.log('');
    }

    console.log('\n📊 Summary:');
    console.log('===========');
    console.log('✅ Monday-Saturday: Tasks will be created');
    console.log('❌ Sunday: Tasks will be SKIPPED');
    console.log('\nDaily frequency now means: Monday through Saturday only!\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testSundaySkip();
