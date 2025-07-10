// backend/utils/checkAndSendDailySummary.js
import User from '../models/User.js';
import Team from '../models/Team.js';
import { sendMail } from './sendMail.js';
import SummaryStatus from '../models/SummaryStatus.js';

const hasSentToday = async (email) => {
  const today = new Date().toISOString().split('T')[0];
  const status = await SummaryStatus.findOne({ email, date: today });
  return !!status;
};

const markSent = async (email) => {
  const today = new Date().toISOString().split('T')[0];
  await SummaryStatus.create({ email, date: today });
};

export const checkAndSendDailySummary = async (userEmail) => {
  console.log(`📩 [checkAndSendDailySummary] Starting for ${userEmail}`);

  const alreadySent = await hasSentToday(userEmail);
  if (alreadySent) {
    console.log(`⏭️ Summary already sent today for ${userEmail}`);
    return;
  }

  const user = await User.findOne({ email: userEmail });
  if (!user) {
    console.log(`❌ No user found for ${userEmail}`);
    return;
  }

  const tasks = await Team.find({ assignedTo: userEmail });
  const completed = tasks.filter(t => t.completedDate).length;
  const pending = tasks.length - completed;

  console.log(`📊 Summary for ${userEmail} → ✅ Completed: ${completed}, 🕒 Pending: ${pending}`);

  const summary = `
Hi ${user.name || userEmail},

Here's your task summary for today:
✅ Completed Tasks: ${completed}
🕒 Pending Tasks: ${pending}

Regards,
Task Tapper`;

  await sendMail(userEmail, '🗓️ Daily Task Summary', summary);
  await markSent(userEmail);
  console.log(`✅ Summary sent and marked for ${userEmail}`);
};
