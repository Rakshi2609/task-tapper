import Team from '../models/Team.js'
import User from '../models/User.js'
// import { sendPushNotification } from '../utils/fcmSender.js';


export const createTask = async (req, res) => {
  const { createdBy, task, assignedTo, assignedName, taskFrequency, dueDate, priority } = req.body;

  console.log("Entered create");

  try {
    const user = await User.findOne({ email: assignedTo });

    // ❌ If no user, return early with an error message
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "The assigned email is not registered in the system.",
      });
    }

    // ✅ Proceed with task creation
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
    console.log("Task Created");

    user.TasksAssigned += 1;
    user.TasksNotStarted += 1;
    await user.save();
    console.log("User task count updated");

    // 🔔 Push notification (if token exists)
    if (user.fcmToken) {
      sendPushNotification(user.fcmToken, "🎉 New Task!", `You have a new task: ${task}`);
    }

    // ✅ Send response
    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: newTask,
    });
  } catch (err) {
    console.error("Create Task Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const acceptTask = async (req, res) => {
  const { taskId, email } = req.body;

  try {
    const task = await Team.findOne({ _id: taskId, assignedTo: email });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    // Add accepted timestamp or flag (you can extend schema for this if needed)

    res.status(200).json({
      success: true,
      message: "Task accepted",
      task,
    });
  } catch (err) {
    console.error("Accept Task Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateTask = async (req, res) => {
  const { taskId, email } = req.body;

  try {
    const task = await Team.findOneAndUpdate(
      { _id: taskId, assignedTo: email },
      { completedDate: new Date() },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    await User.updateOne(
      { email },
      { $inc: { TasksCompleted: 1, TasksNotStarted: -1 } }
    );

    res.status(200).json({
      success: true,
      message: "Task marked as completed",
      task,
    });
  } catch (err) {
    console.error("Update Task Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


export const getAllEmails = async (req, res) => {
  try {
    console.log("Fetching all emails from users");
    const users = await User.find({}, "email");
    const emails = users.map(u => u.email);
    res.json({ emails });
  } catch (err) {
    console.error("Get Emails Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
