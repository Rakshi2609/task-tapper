// import express from 'express';
// import RecurringTask from '../models/recurringTaskModel.js';
// import RecurringTaskUpdate from '../models/recurringTaskUpdate.js';
// import User from '../models/User.js';

// const router = express.Router();

// /**
//  * Gets all recurring tasks.
//  * @route GET /api/recurring-tasks
//  */
// router.get('/recurring-tasks', async (req, res) => {
//     try {
//         const tasks = await RecurringTask.find()
//             .populate('taskAssignedBy', 'username email')
//             .populate('taskAssignedTo', 'username email');

//         res.status(200).json({ success: true, data: tasks });
//     } catch (err) {
//         console.error("[GET /recurring-tasks] Error:", err.message);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// });

// /**
//  * Creates a new recurring task.
//  * @route POST /api/recurring-tasks
//  */
// router.post('/recurring-tasks', async (req, res) => {
//     const {
//         taskName,
//         taskDescription,
//         taskFrequency,
//         taskCreateDaysAhead,
//         taskStartDate,
//         taskEndDate,
//         taskAssignedBy,
//         taskAssignedTo,
//         createdBy,
//     } = req.body;

//     try {
//         const assignedByUser = await User.findOne({ email: taskAssignedBy });
//         const assignedToUser = await User.findOne({ email: taskAssignedTo });

//         if (!assignedByUser || !assignedToUser) {
//             return res.status(400).json({ error: "User(s) not found by email" });
//         }

//         const newTask = new RecurringTask({
//             taskName,
//             taskDescription,
//             taskFrequency,
//             taskCreateDaysAhead,
//             taskStartDate,
//             taskEndDate,
//             taskAssignedBy: assignedByUser._id,
//             taskAssignedTo: assignedToUser._id,
//             createdBy,
//         });

//         const savedTask = await newTask.save();
//         res.status(201).json({ success: true, data: savedTask });
//     } catch (err) {
//         console.error("[POST /recurring-tasks] Error:", err.message);
//         res.status(500).json({ success: false, message: "Failed to create recurring task" });
//     }
// });

// /**
//  * Gets a single recurring task by its ID.
//  * @route GET /api/recurring-tasks/:id
//  */
// router.get('/recurring-tasks/:id', async (req, res) => {
//     const { id } = req.params;

//     try {
//         const task = await RecurringTask.findById(id)
//             .populate('taskAssignedBy', 'username email')
//             .populate('taskAssignedTo', 'username email');

//         if (!task) {
//             return res.status(404).json({ success: false, message: "Task not found" });
//         }

//         res.status(200).json({ success: true, data: task });
//     } catch (err) {
//         console.error(`[GET /recurring-tasks/${id}] Error:`, err.message);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// });

// /**
//  * Deletes a recurring task.
//  * @route DELETE /api/recurring-tasks/:id
//  */
// router.delete('/recurring-tasks/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const deletedTask = await RecurringTask.findByIdAndDelete(id);
//         if (!deletedTask) {
//             return res.status(404).json({ success: false, message: "Task not found" });
//         }
//         res.status(200).json({ success: true, message: "Task deleted successfully" });
//     } catch (err) {
//         console.error(`[DELETE /recurring-tasks/${id}] Error:`, err.message);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// });

// /**
//  * Marks a recurring task as complete.
//  * This route is now a specific PUT route.
//  * @route PUT /api/recurring-tasks/complete/:id
//  */
// router.put('/recurring-tasks/complete/:id', async (req, res) => {
//     const { id } = req.params;
//     const { completedDate } = req.body;

//     try {
//         const task = await RecurringTask.findByIdAndUpdate(
//             id,
//             { completedDate: completedDate || new Date() },
//             { new: true, runValidators: true }
//         );

//         if (!task) {
//             return res.status(404).json({ success: false, message: "Task not found" });
//         }

//         res.status(200).json({ success: true, data: task });
//     } catch (err) {
//         console.error(`[PUT /recurring-tasks/complete/${id}] Error:`, err.message);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// });

// // --- New routes for Recurring Task Updates ---

// /**
//  * Creates a new update/comment for a recurring task.
//  * @route POST /api/recurring-tasks/:taskId/updates
//  */
// router.post('/recurring-tasks/:taskId/updates', async (req, res) => {
//     const { taskId } = req.params;
//     const { updateText, updatedBy, updateType } = req.body;

//     if (!taskId || !updateText || !updatedBy) {
//         return res.status(400).json({
//             success: false,
//             message: "Task ID, update text, and updater's identifier are required."
//         });
//     }

//     try {
//         const existingTask = await RecurringTask.findById(taskId);
//         if (!existingTask) {
//             return res.status(404).json({ success: false, message: "Recurring task not found." });
//         }

//         const newUpdate = new RecurringTaskUpdate({
//             taskId,
//             updateText,
//             updatedBy,
//             updateType: updateType || 'comment',
//         });

//         await newUpdate.save();

//         res.status(201).json({
//             success: true,
//             message: "Recurring task update added successfully!",
//             update: newUpdate,
//         });
//     } catch (err) {
//         console.error(`[POST /recurring-tasks/${taskId}/updates] Error: ${err.message}`, err);
//         res.status(500).json({ success: false, message: "Server Error" });
//     }
// });

// /**
//  * Gets all updates for a specific recurring task.
//  * @route GET /api/recurring-tasks/:taskId/updates
//  */
// router.get('/recurring-tasks/:taskId/updates', async (req, res) => {
//     const { taskId } = req.params;

//     if (!taskId) {
//         return res.status(400).json({
//             success: false,
//             message: "Task ID is required to fetch updates."
//         });
//     }

//     try {
//         const existingTask = await RecurringTask.findById(taskId);
//         if (!existingTask) {
//             return res.status(404).json({ success: false, message: "Recurring task not found." });
//         }

//         const updates = await RecurringTaskUpdate.find({ taskId }).sort({ createdAt: 1 });

//         res.status(200).json({
//             success: true,
//             message: "Recurring task updates fetched successfully!",
//             updates,
//         });
//     } catch (err) {
//         console.error(`[GET /recurring-tasks/${taskId}/updates] Error: ${err.message}`, err);
//         res.status(500).json({ success: false, message: "Server Error" });
//     }
// });

// /**
//  * Deletes a specific update for a recurring task.
//  * @route DELETE /api/recurring-tasks/updates/:updateId
//  */
// router.delete('/recurring-tasks/updates/:updateId', async (req, res) => {
//     const { updateId } = req.params;
//     try {
//         const deletedUpdate = await RecurringTaskUpdate.findByIdAndDelete(updateId);
//         if (!deletedUpdate) {
//             return res.status(404).json({ success: false, message: "Update not found" });
//         }
//         res.status(200).json({ success: true, message: "Update deleted successfully" });
//     } catch (err) {
//         console.error(`[DELETE /recurring-tasks/updates/${updateId}] Error: ${err.message}`, err);
//         res.status(500).json({ success: false, message: "Server Error" });
//     }
// });

// export default router;