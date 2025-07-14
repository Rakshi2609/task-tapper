import mongoose from 'mongoose';
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

  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const tasksToday = await Team.find({
    assignedTo: userEmail,
    dueDate: { $gte: startOfDay, $lte: endOfDay }
  });

  const completed = tasksToday.filter(t => t.completedDate).length;
  const pending = tasksToday.length - completed;

  const checklist = tasksToday.map(task => {
    const status = task.completedDate ? '✅' : '🔲';
    return `${status} ${task.task}`;
  }).join('\n');

  const summary = `
Hi ${user.username || userEmail},

📅 **Daily Task Summary** for ${new Date().toLocaleDateString('en-IN')}:

✅ Completed Tasks: ${completed}
🕒 Pending Tasks: ${pending}

📝 **Checklist**:
${checklist || 'No tasks scheduled for today.'}

Keep up the good work!

Regards,  
Task Tapper
`;

  await sendMail(userEmail, '🗓️ Your Daily Task Summary', summary);
  await markSent(userEmail);
  console.log(`✅ Summary sent and marked for ${userEmail}`);
};
