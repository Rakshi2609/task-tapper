// import mongoose from 'mongoose';
// import User from '../models/User.js';
// import Team from '../models/Team.js';
// import { sendMail } from './sendMail.js';
// import SummaryStatus from '../models/SummaryStatus.js';

// const hasSentToday = async (email) => {
//   const today = new Date().toISOString().split('T')[0];
//   const status = await SummaryStatus.findOne({ email, date: today });
//   return !!status;
// };

// const markSent = async (email) => {
//   const today = new Date().toISOString().split('T')[0];
//   await SummaryStatus.create({ email, date: today });
// };

// export const checkAndSendDailySummary = async (userEmail) => {
//   console.log(`📩 [checkAndSendDailySummary] Starting for ${userEmail}`);

//   const alreadySent = await hasSentToday(userEmail);
//   if (alreadySent) {
//     console.log(`⏭️ Summary already sent today for ${userEmail}`);
//     return;
//   }

//   const user = await User.findOne({ email: userEmail });
//   if (!user) {
//     console.log(`❌ No user found for ${userEmail}`);
//     return;
//   }

//   const today = new Date();
//   const startOfDay = new Date(today.setHours(0, 0, 0, 0));
//   const endOfDay = new Date(today.setHours(23, 59, 59, 999));

//   const tasksToday = await Team.find({
//     assignedTo: userEmail,
//     dueDate: { $gte: startOfDay, $lte: endOfDay }
//   });

//   const completed = tasksToday.filter(t => t.completedDate).length;
//   const pending = tasksToday.length - completed;

//   const checklist = tasksToday.map(task => {
//     const status = task.completedDate ? '✅' : '🔲';
//     return `${status} ${task.task}`;
//   }).join('\n');

//   const summary = `
// Hi ${user.username || userEmail},

// 📅 **Daily Task Summary** for ${new Date().toLocaleDateString('en-IN')}:

// ✅ Completed Tasks: ${completed}
// 🕒 Pending Tasks: ${pending}

// 📝 **Checklist**:
// ${checklist || 'No tasks scheduled for today.'}

// Keep up the good work!

// Regards,  
// Task Tapper
// `;

//   await sendMail(userEmail, '🗓️ Your Daily Task Summary', summary);
//   await markSent(userEmail);
//   console.log(`✅ Summary sent and marked for ${userEmail}`);
// };


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

  const checklistToday = tasksToday.map(task => {
    const status = task.completedDate ? '✅' : '🔲';
    return `${status} ${task.task}`;
  }).join('\n');

  // ✅ Overdue tasks (before today and not completed)
  const overdueTasks = await Team.find({
    assignedTo: userEmail,
    dueDate: { $lt: startOfDay },
    completedDate: { $exists: false }
  });

  const checklistOverdue = overdueTasks.map(task => `⚠️ ${task.task} (Due: ${new Date(task.dueDate).toLocaleDateString('en-IN')})`).join('\n');

  // 📅 Tomorrow’s tasks and frequency-based tasks
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
  const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));

  const tasksTomorrow = await Team.find({
    assignedTo: userEmail,
    $or: [
      { dueDate: { $gte: startOfTomorrow, $lte: endOfTomorrow } },
      { taskFrequency: { $in: ['Daily', 'Weekly', 'Monthly'] } }
    ]
  });

  const checklistTomorrow = tasksTomorrow.map(task => {
    return `📌 ${task.task} (${task.taskFrequency || 'OneTime'})`;
  }).join('\n');

  // 📧 Build summary message
  const summary = `
Hi ${user.username || userEmail},

📅 **Daily Task Summary** for ${new Date().toLocaleDateString('en-IN')}:

✅ Completed Today: ${completed}
🕒 Pending Today: ${pending}

📝 **Today's Checklist**:
${checklistToday || 'No tasks scheduled for today.'}

⚠️ **Overdue Tasks**:
${checklistOverdue || 'None 🎉'}

🔮 **Tasks for Tomorrow**:
${checklistTomorrow || 'None planned yet.'}

Keep up the good work!

Regards,  
Task Tapper
`;

  await sendMail(userEmail, '🗓️ Your Daily Task Summary', summary);
  await markSent(userEmail);
  console.log(`✅ Summary sent and marked for ${userEmail}`);
};
