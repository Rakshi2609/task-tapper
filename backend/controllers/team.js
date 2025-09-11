import Team from '../models/Team.js';
import  User from '../models/User.js'; // Assuming User and UserDetail are in User.js
import TaskUpdate from '../models/TaskUpdate.js'; // <-- Import the new TaskUpdate model
import { emitSystemMessage } from '../socket/worldChat.js';
import { UserDetail } from '../models/userDetail.js';
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

    if (newDate.getDay() === 0) { // getDay() returns 0 for Sunday
        console.log(`[calculateNextDueDate] newDate ${newDate} is a Sunday. Adjusting to Monday.`);
        newDate.setDate(newDate.getDate() + 1); // Add one more day to skip Sunday
        console.log(`[calculateNextDueDate] newDate after adjusting for Sunday: ${newDate}`);
    }

    console.log(`[calculateNextDueDate] Final calculated newDate: ${newDate}`);
    return newDate;
};

export const createTask = async (req, res) => {
    const { createdBy, taskName, taskDescription, assignedTo, assignedName, taskFrequency, dueDate, priority } = req.body;
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
            taskName,
            taskDescription,
            assignedTo,
            assignedName,
            taskFrequency,
            dueDate,
            priority,
        });

        await newTask.save();
        console.log("Task Created successfully:", newTask._id);

        // No need for this line here, as `task` is not defined yet from the context of a *created* task
        // await emitSystemMessage(io, `${user.username} has completed task: "${task.task}"`);


        user.TasksAssigned += 1;
        user.TasksNotStarted += 1;
        await user.save();
        console.log(`[createTask] User task count updated for ${user.email}: TasksAssigned=${user.TasksAssigned}, TasksNotStarted=${user.TasksNotStarted}`);

        // Push notification (if token exists) - uncomment if you implement
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
                    taskName: task.taskName, // Corrected from task.task to task.taskName
                    taskDescription: task.taskDescription, // Added taskDescription
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
            // Updated to use task.taskName for clarity
            await emitSystemMessage(io, `${user.username} has completed task: "${task.taskName}"`);
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

export const deleteTask = async (req, res) => {
    const { taskId } = req.body;
    const io = req.io; // ✅ access Socket.IO instance
    console.log("Entered deleteTask function");
    console.log(`[deleteTask] Request body: taskId=${taskId}`);

    try {
        // 1. Find the task to be deleted
        const task = await Team.findById(taskId);
        if (!task) {
            console.log(`[deleteTask] Task not found for ID: ${taskId}`);
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        // 2. Find the user who was assigned the task
        const user = await User.findOne({ email: task.assignedTo });

        if (user) {
            // Update task counters
            user.TasksAssigned = Math.max(0, user.TasksAssigned - 1);
            if (!task.completedDate) { // Only decrement TasksNotStarted if it was not completed
                user.TasksNotStarted = Math.max(0, user.TasksNotStarted - 1);
            } else { // If task was completed, decrement TasksCompleted instead
                user.TasksCompleted = Math.max(0, user.TasksCompleted - 1);
            }
            await user.save();
            console.log(`[deleteTask] Updated user task counters for ${user.email}`);

            // ✅ Emit a system message to world chat (using taskName)
            await emitSystemMessage(io, `${user.username} has deleted the task: "${task.taskName}"`);
        }

        // 3. Delete the task
        await Team.deleteOne({ _id: taskId });
        console.log(`[deleteTask] Task ${taskId} deleted successfully`);

        res.status(200).json({
            success: true,
            message: "Task deleted successfully",
        });
    } catch (err) {
        console.error(`[deleteTask] Delete Task Error: ${err.message}`, err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * Route to get a user's detailed information (phone number, role)
 * by their email address.
 * It also populates the linked User data for completeness.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const getUserDetail = async (req, res) => {
    const { email } = req.query; // Assuming email is passed as a query parameter
    console.log("Entered getUserDetail function");
    console.log(`[getUserDetail] Request query: email=${email}`);

    if (!email) {
        console.log("[getUserDetail] Error: Email not provided in query.");
        return res.status(400).json({
            success: false,
            message: "Email is required to fetch user details."
        });
    }

    try {
        // First, find the User to get their _id
        const user = await User.findOne({ email });
        console.log(`[getUserDetail] User found for email (${email}): ${user ? user._id : 'None'}`);

        if (!user) {
            console.log(`[getUserDetail] Error: User with email '${email}' not found.`);
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        // Then, find the UserDetail document using the User's _id
        // and populate the 'user' field to include the User's core info
        const userDetail = await UserDetail.findOne({ user: user._id }).populate('user');
        console.log(`[getUserDetail] UserDetail found for userId (${user._id}): ${userDetail ? userDetail._id : 'None'}`);


        if (!userDetail) {
            console.log(`[getUserDetail] Error: User details not found for user ID: ${user._id}`);
            return res.status(404).json({
                success: false,
                message: "User details not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "User details fetched successfully",
            userDetail: userDetail
        });
        console.log("[getUserDetail] Response sent: User details fetched successfully.");

    } catch (err) {
        console.error(`[getUserDetail] Get User Detail Error: ${err.message}`, err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * Route to save (create or update) a user's detailed information (phone number, role).
 * This endpoint should be called after a user has successfully signed up/logged in.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const saveUserDetailBackend = async (req, res) => {
    const { email, phoneNumber, role } = req.body;
    console.log("Entered saveUserDetailBackend function");
    console.log(`[saveUserDetailBackend] Request body: email=${email}, phoneNumber=${phoneNumber}, role=${role}`);

    if (!email || !phoneNumber || !role) {
        console.log("[saveUserDetailBackend] Error: Missing required fields.");
        return res.status(400).json({
            success: false,
            message: "Email, phone number, and role are required."
        });
    }

    try {
        // 1. Find the User by email
        const user = await User.findOne({ email });
        console.log(`[saveUserDetailBackend] User found for email (${email}): ${user ? user._id : 'None'}`);

        if (!user) {
            console.log(`[saveUserDetailBackend] Error: User with email '${email}' not found.`);
            return res.status(404).json({
                success: false,
                message: "User not found. Please sign up first."
            });
        }

        // 2. Find or create the UserDetail document for this user
        // We use findOneAndUpdate with upsert: true to either update if exists or create if not.
        const userDetail = await UserDetail.findOneAndUpdate(
            { user: user._id }, // Query by the User's ObjectId
            { phoneNumber, role }, // Fields to set/update
            { new: true, upsert: true, runValidators: true } // Return new doc, create if not found, run schema validators
        );
        console.log(`[saveUserDetailBackend] UserDetail document processed: ${userDetail._id}`);

        res.status(200).json({
            success: true,
            message: "User details saved successfully!",
            userDetail: userDetail // Send back the saved/updated userDetail
        });
        console.log("[saveUserDetailBackend] Response sent: User details saved successfully.");

    } catch (err) {
        console.error(`[saveUserDetailBackend] Save User Detail Error: ${err.message}`, err);
        // Handle specific Mongoose validation errors if needed
        if (err.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: err.message });
        }
        res.status(500).json({ success: false, message: "Server Error" });
    }
};


// NEW FUNCTIONS FOR TASK UPDATES
/**
 * Creates a new update/comment for a specific task.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const createTaskUpdate = async (req, res) => {
    // Correctly extract taskId from URL parameters (req.params)
    const { taskId: paramTaskId } = req.params; 
    const { updateText, updatedBy, updateType } = req.body; // Extract other fields from req.body

    console.log("Entered createTaskUpdate function");
    // IMPORTANT: Changed this log to clearly show params and body separately
    console.log(`[createTaskUpdate] Request params: taskId=${paramTaskId}`);
    console.log(`[createTaskUpdate] Request body: updateText=${updateText}, updatedBy=${updatedBy}, updateType=${updateType}`);

    // Validate that the taskId from params and other required body fields are present
    if (!paramTaskId || !updateText || !updatedBy) {
        console.log("[createTaskUpdate] Error: Missing required fields in params or body."); 
        return res.status(400).json({
            success: false,
            message: "Task ID (from URL), update text, and updater's identifier are required."
        });
    }

    try {
        // Optional: Verify if the taskId actually exists in the Team collection
        const existingTask = await Team.findById(paramTaskId); // Use paramTaskId for finding the task
        if (!existingTask) {
            console.log(`[createTaskUpdate] Error: Task with ID '${paramTaskId}' not found.`);
            return res.status(404).json({ success: false, message: "Task not found." });
        }

        const newUpdate = new TaskUpdate({
            taskId: paramTaskId, // Use paramTaskId when creating the new TaskUpdate document
            updateText,
            updatedBy,
            updateType: updateType || 'comment', // Use provided type or default to 'comment'
        });

        await newUpdate.save();
        console.log(`Task update created successfully for task ${paramTaskId}: ${newUpdate._id}`);

        res.status(201).json({
            success: true,
            message: "Task update added successfully!",
            update: newUpdate,
        });
    } catch (err) {
        console.error(`[createTaskUpdate] Error: ${err.message}`, err);
        // Handle Mongoose validation errors
        if (err.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: err.message });
        }
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * Gets all updates/comments for a specific task.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const getTaskUpdates = async (req, res) => {
    const { taskId } = req.params; // Expect taskId from URL parameter, not query
    console.log("Entered getTaskUpdates function");
    console.log(`[getTaskUpdates] Request param: taskId=${taskId}`);

    if (!taskId) {
        console.log("[getTaskUpdates] Error: Task ID not provided in params.");
        return res.status(400).json({
            success: false,
            message: "Task ID is required to fetch updates."
        });
    }

    try {
        // Optional: Verify if the taskId actually exists in the Team collection
        const existingTask = await Team.findById(taskId);
        if (!existingTask) {
            console.log(`[getTaskUpdates] Error: Task with ID '${taskId}' not found.`);
            return res.status(404).json({ success: false, message: "Task not found." });
        }

        const updates = await TaskUpdate.find({ taskId })
                                        .sort({ createdAt: 1 }); // Sort by creation date, ascending
        console.log(`Found ${updates.length} updates for task ${taskId}.`);

        res.status(200).json({
            success: true,
            message: "Task updates fetched successfully!",
            updates: updates,
        });
    } catch (err) {
        console.error(`[getTaskUpdates] Error: ${err.message}`, err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * Gets a single task by its ID.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const getTaskById = async (req, res) => {
    const { taskId } = req.params; // Get ID from URL parameter
    console.log("Entered getTaskById function");
    console.log(`[getTaskById] Request param: taskId=${taskId}`);

    try {
        const task = await Team.findById(taskId);
        if (!task) {
            console.log(`[getTaskById] Error: Task with ID '${taskId}' not found.`);
            return res.status(404).json({ success: false, message: "Task not found." });
        }
        res.status(200).json({ success: true, task });
        console.log(`[getTaskById] Task found: ${task._id}`);
    } catch (err) {
        console.error(`[getTaskById] Error: ${err.message}`, err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
