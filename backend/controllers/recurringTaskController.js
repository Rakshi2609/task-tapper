import RecurringTask from "../models/recurringTaskModel.js";
import RecurringTaskUpdate from "../models/recurringTaskUpdate.js";
import User from "../models/User.js";
import mongoose from "mongoose";


// ✅ GET ALL RECURRING TASKS
export const getAllRecurringTasks = async (req, res) => {
  try {
    const tasks = await RecurringTask.find()
      .populate("taskAssignedBy", "username email")
      .populate("taskAssignedTo", "username email");

    res.status(200).json({ success: true, data: tasks });
  } catch (err) {
    console.error("[getAllRecurringTasks] Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ CREATE RECURRING TASK
// ✅ CREATE RECURRING TASK (FINAL FIXED VERSION)
export const createRecurringTask = async (req, res) => {
  const {
    taskName,
    taskDescription,
    taskFrequency,
    taskCreateDaysAhead,
    taskStartDate,
    taskEndDate,
    taskAssignedBy,
    taskAssignedTo,
    createdBy,
  } = req.body;

  console.log("🔥 DEBUG RECURRING COMMUNITY PAYLOAD:", {
    taskAssignedBy,
    taskAssignedTo,
    createdBy,
    community: req.body.community,
    communityDept: req.body.communityDept,
  });

  try {
    const assignedByUser = await User.findOne({
      $or: [
        { email: taskAssignedBy },
        { userEmail: taskAssignedBy },
        { mail: taskAssignedBy },
        { username: taskAssignedBy },
      ],
    });

    const assignedToUser = await User.findOne({
      $or: [
        { email: taskAssignedTo },
        { userEmail: taskAssignedTo },
        { mail: taskAssignedTo },
        { username: taskAssignedTo },
      ],
    });

    console.log("✅ FOUND USERS AFTER FIX:", {
      assignedByUser: assignedByUser?._id,
      assignedToUser: assignedToUser?._id,
    });

    if (!assignedByUser || !assignedToUser) {
      return res.status(400).json({
        success: false,
        message: "Assigned user(s) not found in DB",
        debug: { taskAssignedBy, taskAssignedTo },
      });
    }

    const newTask = new RecurringTask({
      taskName,
      taskDescription,
      taskFrequency,
      taskCreateDaysAhead,
      taskStartDate,
      taskEndDate,
      taskAssignedBy: assignedByUser._id,
      taskAssignedTo: assignedToUser._id,
      createdBy,

      // ✅ COMMUNITY SUPPORT
      community: req.body.community || null,
      communityDept: req.body.communityDept || null,
    });

    const savedTask = await newTask.save();

    res.status(201).json({
      success: true,
      message: "✅ Community recurring task created successfully",
      data: savedTask,
    });
  } catch (err) {
    console.error("[createRecurringTask] Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to create recurring task",
    });
  }
};




// ✅ GET SINGLE RECURRING TASK
export const getRecurringTaskById = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await RecurringTask.findById(id)
      .populate("taskAssignedBy", "username email")
      .populate("taskAssignedTo", "username email");

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    console.error("[getRecurringTaskById] Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ DELETE RECURRING TASK
export const deleteRecurringTask = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTask = await RecurringTask.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.status(200).json({ success: true, message: "Task deleted successfully" });
  } catch (err) {
    console.error("[deleteRecurringTask] Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ MARK RECURRING TASK COMPLETE
export const completeRecurringTask = async (req, res) => {
  const { id } = req.params;
  const { completedDate } = req.body;

  try {
    const task = await RecurringTask.findByIdAndUpdate(
      id,
      { completedDate: completedDate || new Date() },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    console.error("[completeRecurringTask] Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ ADD RECURRING TASK UPDATE
export const createRecurringTaskUpdate = async (req, res) => {
  const { taskId } = req.params;
  const { updateText, updatedBy, updateType } = req.body;

  if (!taskId || !updateText || !updatedBy) {
    return res.status(400).json({
      success: false,
      message: "Task ID, update text, and updater's identifier are required.",
    });
  }

  try {
    const existingTask = await RecurringTask.findById(taskId);
    if (!existingTask) {
      return res.status(404).json({ success: false, message: "Recurring task not found." });
    }

    const newUpdate = new RecurringTaskUpdate({
      taskId,
      updateText,
      updatedBy,
      updateType: updateType || "comment",
    });

    await newUpdate.save();

    res.status(201).json({
      success: true,
      message: "Recurring task update added successfully!",
      update: newUpdate,
    });
  } catch (err) {
    console.error("[createRecurringTaskUpdate] Error:", err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ GET RECURRING TASK UPDATES
export const getRecurringTaskUpdates = async (req, res) => {
  const { taskId } = req.params;

  if (!taskId) {
    return res.status(400).json({
      success: false,
      message: "Task ID is required to fetch updates.",
    });
  }

  try {
    const existingTask = await RecurringTask.findById(taskId);
    if (!existingTask) {
      return res.status(404).json({ success: false, message: "Recurring task not found." });
    }

    const updates = await RecurringTaskUpdate.find({ taskId }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      message: "Recurring task updates fetched successfully!",
      updates,
    });
  } catch (err) {
    console.error("[getRecurringTaskUpdates] Error:", err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ DELETE RECURRING TASK UPDATE
export const deleteRecurringTaskUpdate = async (req, res) => {
  const { updateId } = req.params;

  try {
    const deletedUpdate = await RecurringTaskUpdate.findByIdAndDelete(updateId);
    if (!deletedUpdate) {
      return res.status(404).json({ success: false, message: "Update not found" });
    }

    res.status(200).json({ success: true, message: "Update deleted successfully" });
  } catch (err) {
    console.error("[deleteRecurringTaskUpdate] Error:", err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
