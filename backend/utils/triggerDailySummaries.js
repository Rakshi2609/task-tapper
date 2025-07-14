// backend/utils/triggerDailySummaries.js
import User from '../models/User.js';
import { checkAndSendDailySummary } from './checkAndSendDailySummary.js';

export const triggerDailySummaries = async () => {
  const currentHour = new Date().getHours();
  if (currentHour < 18) {
    console.log('⏰ Too early for summary. Skipping...');
    return;
  }

  const users = await User.find({}); // Or add condition like `{ active: true }`
  for (const user of users) {
    await checkAndSendDailySummary(user.email);
  }
};
