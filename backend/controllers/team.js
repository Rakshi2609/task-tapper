import Team from '../models/Team.js';
import User from '../models/User.js';
import { emitSystemMessage } from '../socket/worldChat.js';

/**
 * Helper function to calculate the next due date based on frequency, skipping Sundays.
 * @param {Date} baseDate - The date from which to calculate the next due date (e.g., completedDate).
 * @param {string} frequency - The frequency ('Daily', 'Weekly', 'Monthly').
 * @returns {Date | null} The calculated next due date, or null if frequency is 'OneTime' or invalid.
 */



const calculateNextDueDate = (baseDate, frequency) => {
  console.log(`[calculateNextDueDate] Calculating next due date for baseDate: ${baseDate}, frequency: ${frequency}`);
  let newDate = new Date(baseDate); 
  console.log(`[calculateNextDueDate] Initial newDate: ${newDate}`);

  switch (frequency) {
    case 'Daily':
      newDate.setDate(newDate.getDate() + 1);
      console.log(`[calculateNextDueDate] Daily: newDate after adding 1 day: ${newDate}`);
      break;
    case 'Weekly':
      newDate.setDate(newDate.getDate() + 7);
      console.log(`[calculateNextDueDate] Weekly: newDate after adding 7 days: ${newDate}`);
      break;
    case 'Monthly':
      newDate.setMonth(newDate.getMonth() + 1);
      console.log(`[calculateNextDueDate] Monthly: newDate after adding 1 month: ${newDate}`);
      break;
    default:
      console.log(`[calculateNextDueDate] Frequency '${frequency}' is 'OneTime' or unsupported. Returning null.`);
      return null;
  }

  if (newDate.getDay() === 0) {
    console.log(`[calculateNextDueDate] newDate ${newDate} is a Sunday. Adjusting to Monday.`);
    newDate.setDate(newDate.getDate() + 1); 
    console.log(`[calculateNextDueDate] newDate after adjusting for Sunday: ${newDate}`);
  }

  console.log(`[calculateNextDueDate] Final calculated newDate: ${newDate}`);
  return newDate;
};

export const createTask = async (req, res) => {
  const { createdBy, task, assignedTo, assignedName, taskFrequency, dueDate, priority } = req.body;
  const io = req.io;

  console.log("Entered createTask function");
  console.log(`[createTask] Request body: ${JSON.stringify(req.body)}`);

  try {
    const user = await User.findOne({ email: assignedTo });
    console.log(`[createTask] User found for assignedTo (${assignedTo}): ${user ? user.email : 'None'}`);

    // If no user, return early with an error message
    if (!user) {
      console.log(`[createTask] Error: Assigned email '${assignedTo}' is not registered.`);
      return res.status(404).json({
        success: false,
        message: "The assigned email is not registered in the system.",
      });
    }

    // Proceed with task creation
    const newTask = new Team({
      createdBy,
      task,
      assignedTo,
      assignedName,
      taskFrequency,
      dueDate,
      priority,
    });

    await newTask.save();
    console.log("Task Created successfully:", newTask._id);
//     const user = await User.findOne({ email }); // ✅ fetch user using email
// if (user) {
  await emitSystemMessage(io, `${user.username} has completed task: "${task.task}"`);
// }


    user.TasksAssigned += 1;
    user.TasksNotStarted += 1;
    await user.save();
    console.log(`[createTask] User task count updated for ${user.email}: TasksAssigned=${user.TasksAssigned}, TasksNotStarted=${user.TasksNotStarted}`);

    // Push notification (if token exists)
    // if (user.fcmToken) {
    //   sendPushNotification(user.fcmToken, "🎉 New Task!", `You have a new task: ${task}`);
    //   console.log(`[createTask] Push notification sent to ${user.email}`);
    // }

    // Send response
    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: newTask,
    });
    console.log("[createTask] Response sent: Task created successfully.");
  } catch (err) {
    console.error(`[createTask] Create Task Error: ${err.message}`, err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


export const updateTask = async (req, res) => {
  const { taskId, email } = req.body;
  const io = req.io;

  console.log("Entered updateTask function");
  console.log(`[updateTask] Request body: taskId=${taskId}, email=${email}`);

  try {
    const task = await Team.findOneAndUpdate(
      { _id: taskId, assignedTo: email },
      { completedDate: new Date() }, 
      { new: true } 
    );
    console.log(`[updateTask] Attempted to find and update task with _id: ${taskId}, assignedTo: ${email}`);

    if (!task) {
      console.log(`[updateTask] Error: Task not found or not assigned to email '${email}' for taskId: ${taskId}`);
      return res.status(404).json({ success: false, message: "Task not found or not assigned to this email." });
    }
    console.log(`[updateTask] Task found and updated: ${task._id}, completedDate: ${task.completedDate}`);

    const userUpdateResult = await User.updateOne(
      { email },
      { $inc: { TasksCompleted: 1, TasksNotStarted: -1 } }
    );
    console.log(`[updateTask] User ${email} task counts update result: ${JSON.stringify(userUpdateResult)}`);
    console.log(`[updateTask] User ${email} task counts updated for completed task.`);

    let generatedNewTask = null;

    // 3. Check task frequency and generate a new task if it's recurring
    if (['Daily', 'Weekly', 'Monthly'].includes(task.taskFrequency)) {
      console.log(`[updateTask] Task frequency '${task.taskFrequency}' is recurring. Attempting to generate new task.`);
      const newDueDate = calculateNextDueDate(task.completedDate, task.taskFrequency);
      console.log(`[updateTask] Calculated newDueDate for recurring task: ${newDueDate}`);

      if (newDueDate) {
        const newTask = new Team({
          createdBy: task.createdBy,
          task: task.task,
          assignedTo: task.assignedTo,
          assignedName: task.assignedName,
          taskFrequency: task.taskFrequency,
          dueDate: newDueDate, 
          priority: task.priority,
        
        });

        await newTask.save();
        generatedNewTask = newTask;
        console.log("New recurring task generated:", newTask._id);

        const assignedUser = await User.findOne({ email: task.assignedTo });
        if (assignedUser) {
          assignedUser.TasksAssigned += 1;
          assignedUser.TasksNotStarted += 1;
          await assignedUser.save();
          console.log(`[updateTask] User ${assignedUser.email} task counts updated for new recurring task: TasksAssigned=${assignedUser.TasksAssigned}, TasksNotStarted=${assignedUser.TasksNotStarted}`);

        }
      } else {
        console.log("[updateTask] New due date could not be calculated for recurring task (e.g., 'OneTime' was passed). No new task generated.");
      }
    } else {
      console.log(`[updateTask] Task frequency '${task.taskFrequency}' is not recurring. No new task generated.`);
    }

    const user = await User.findOne({ email }); // ✅ fetch user using email
if (user) {
  await emitSystemMessage(io, `${user.username} has completed task: "${task.task}"`);
}

    
    res.status(200).json({
      success: true,
      message: "Task marked as completed and recurring task generated (if applicable).",
      completedTask: task,
      generatedNewTask: generatedNewTask, 
    });
    console.log("[updateTask] Response sent: Task completed and recurring task handled.");
  } catch (err) {
    console.error(`[updateTask] Update Task Error: ${err.message}`, err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


export const getAllEmails = async (req, res) => {
  console.log("Entered getAllEmails function");
  try {
    console.log("Fetching all emails from users");
    const users = await User.find({}, "email");
    const emails = users.map(u => u.email);
    console.log(`[getAllEmails] Found ${emails.length} emails.`);
    res.json({ emails });
    console.log("[getAllEmails] Response sent: All emails.");
  } catch (err) {
    console.error(`[getAllEmails] Get Emails Error: ${err.message}`, err);
    res.status(500).json({ message: "Server Error" });
  }
};

// The generateTask function is no longer needed as a separate export;
// its logic has been integrated into updateTask.
// export const generateTask = async (req, res) => { /* ... */ };

export const getAssignedTasks = async (req, res) => {
  const { email } = req.query;
  console.log("Entered getAssignedTasks function");
  console.log(`[getAssignedTasks] Request query: email=${email}`);

  try {
    const tasks = await Team.find({ assignedTo: email });
    console.log(`[getAssignedTasks] Found ${tasks.length} tasks for user ${email}.`);
    res.json({ tasks });
  } catch (err) {
    console.error(`[getAssignedTasks] Get Assigned Tasks Error: ${err.message}`, err);
    res.status(500).json({ message: "Server Error" });
  }
};