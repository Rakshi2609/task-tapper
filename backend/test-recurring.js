// Test script for recurring task logic
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import RecurringTask from './models/recurringTaskModel.js';
import Team from './models/Team.js';
import User from './models/User.js';
import { generateRecurringTaskInstances } from './taskScheduler.js';

dotenv.config();

const testRecurringLogic = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Test Case 1: Daily Task
    console.log('\n📋 TEST CASE 1: Daily Recurring Task');
    console.log('====================================');
    
    const testUser = await User.findOne();
    if (!testUser) {
      console.log('❌ No users found in database. Please create a user first.');
      process.exit(1);
    }
    console.log(`✅ Found test user: ${testUser.email}`);

    // Create a daily recurring task starting today for 3 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);

    // Clean up any existing test tasks
    await RecurringTask.deleteMany({ taskName: 'Test Daily Task' });
    await Team.deleteMany({ taskName: 'Test Daily Task' });

    const dailyTask = new RecurringTask({
      taskName: 'Test Daily Task',
      taskDescription: 'This is a test daily task',
      taskFrequency: 'Daily',
      taskCreateDaysAhead: 1,
      taskStartDate: today,
      taskEndDate: threeDaysLater,
      taskAssignedBy: testUser._id,
      taskAssignedTo: testUser._id,
      createdBy: testUser.email,
      priority: 'High'
    });

    await dailyTask.save();
    console.log(`✅ Created recurring task: "${dailyTask.taskName}"`);
    console.log(`   Start: ${dailyTask.taskStartDate.toDateString()}`);
    console.log(`   End: ${dailyTask.taskEndDate.toDateString()}`);
    console.log(`   Frequency: ${dailyTask.taskFrequency}`);
    console.log(`   Today: ${today.toDateString()} (Day of week: ${today.getDay()}) ${today.getDay() === 0 ? '⚠️  SUNDAY - Will be skipped' : '✅'}`);

    // Test Case 2: Generate task instances
    console.log('\n🔄 TEST CASE 2: Generate Task Instances');
    console.log('====================================');
    
    const results = await generateRecurringTaskInstances();
    console.log('Generation Results:', JSON.stringify(results, null, 2));

    // Test Case 3: Verify created instances
    console.log('\n🔍 TEST CASE 3: Verify Created Instances');
    console.log('====================================');
    
    const instances = await Team.find({ recurringTaskId: dailyTask._id }).sort({ dueDate: 1 });
    console.log(`✅ Found ${instances.length} task instance(s)`);
    
    instances.forEach((instance, index) => {
      console.log(`   Instance ${index + 1}:`);
      console.log(`     - Name: ${instance.taskName}`);
      console.log(`     - Due Date: ${instance.dueDate.toDateString()}`);
      console.log(`     - Priority: ${instance.priority}`);
      console.log(`     - Assigned To: ${instance.assignedTo}`);
      console.log(`     - Frequency: ${instance.taskFrequency}`);
    });

    // Test Case 4: Try generating again (should skip duplicates)
    console.log('\n🔄 TEST CASE 4: Test Duplicate Prevention');
    console.log('====================================');
    
    const results2 = await generateRecurringTaskInstances();
    console.log('Second Generation Results:', JSON.stringify(results2, null, 2));

    // Test Case 5: Weekly Task Logic
    console.log('\n📋 TEST CASE 5: Weekly Recurring Task Logic');
    console.log('====================================');
    
    const weeklyStartDate = new Date(today);
    weeklyStartDate.setDate(today.getDate() - 7); // Start 7 days ago
    
    const weeklyEndDate = new Date(today);
    weeklyEndDate.setDate(today.getDate() + 7);

    await RecurringTask.deleteMany({ taskName: 'Test Weekly Task' });
    await Team.deleteMany({ taskName: 'Test Weekly Task' });

    const weeklyTask = new RecurringTask({
      taskName: 'Test Weekly Task',
      taskDescription: 'This is a test weekly task',
      taskFrequency: 'Weekly',
      taskCreateDaysAhead: 1,
      taskStartDate: weeklyStartDate,
      taskEndDate: weeklyEndDate,
      taskAssignedBy: testUser._id,
      taskAssignedTo: testUser._id,
      createdBy: testUser.email,
      priority: 'Medium'
    });

    await weeklyTask.save();
    console.log(`✅ Created weekly recurring task: "${weeklyTask.taskName}"`);
    console.log(`   Start: ${weeklyTask.taskStartDate.toDateString()}`);
    console.log(`   End: ${weeklyTask.taskEndDate.toDateString()}`);
    
    const daysDiff = Math.floor((today - weeklyStartDate) / (1000 * 60 * 60 * 24));
    const shouldCreateToday = daysDiff % 7 === 0;
    console.log(`   Days since start: ${daysDiff}`);
    console.log(`   Should create today: ${shouldCreateToday}`);

    // Test Case 6: Monthly Task Logic
    console.log('\n📋 TEST CASE 6: Monthly Recurring Task Logic');
    console.log('====================================');
    
    const monthlyStartDate = new Date(today);
    monthlyStartDate.setMonth(today.getMonth() - 1); // Start 1 month ago
    
    const monthlyEndDate = new Date(today);
    monthlyEndDate.setMonth(today.getMonth() + 1);

    await RecurringTask.deleteMany({ taskName: 'Test Monthly Task' });
    await Team.deleteMany({ taskName: 'Test Monthly Task' });

    const monthlyTask = new RecurringTask({
      taskName: 'Test Monthly Task',
      taskDescription: 'This is a test monthly task',
      taskFrequency: 'Monthly',
      taskCreateDaysAhead: 1,
      taskStartDate: monthlyStartDate,
      taskEndDate: monthlyEndDate,
      taskAssignedBy: testUser._id,
      taskAssignedTo: testUser._id,
      createdBy: testUser.email,
      priority: 'Low'
    });

    await monthlyTask.save();
    console.log(`✅ Created monthly recurring task: "${monthlyTask.taskName}"`);
    console.log(`   Start: ${monthlyTask.taskStartDate.toDateString()} (Day: ${monthlyTask.taskStartDate.getDate()})`);
    console.log(`   End: ${monthlyTask.taskEndDate.toDateString()}`);
    console.log(`   Today's date: ${today.getDate()}`);
    console.log(`   Should create today: ${today.getDate() === monthlyTask.taskStartDate.getDate()}`);

    console.log('\n✅ ALL TESTS COMPLETED');
    console.log('====================================');
    console.log('Summary:');
    console.log(`- Daily task should create instances for today`);
    console.log(`- Duplicate prevention should work`);
    console.log(`- Weekly task creates every 7 days from start date`);
    console.log(`- Monthly task creates on same day of month as start date`);

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

// Run the tests
testRecurringLogic();
