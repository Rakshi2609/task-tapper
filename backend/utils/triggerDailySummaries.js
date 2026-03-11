// backend/utils/triggerDailySummaries.js
import User from '../models/User.js';
import { checkAndSendDailySummary } from './checkAndSendDailySummary.js';

export const triggerDailySummaries = async () => {
  const currentHour = new Date().getHours();
  console.log(`⏰ Current hour: ${currentHour}`);
  
  if (currentHour < 18) {
    console.log('⏰ Too early for summary. Skipping...');
    return;
  }

  console.log('📧 Starting daily summaries for all users...');
  const users = await User.find({}); 
  console.log(`👥 Found ${users.length} users to process`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const user of users) {
    try {
      await checkAndSendDailySummary(user.email);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to send summary to ${user.email}:`, error.message);
      failCount++;
    }
  }
  
  console.log(`✅ Summary sending complete: ${successCount} sent, ${failCount} failed`);
};
