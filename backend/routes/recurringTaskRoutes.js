import express from "express";
import {
  getAllRecurringTasks,
  createRecurringTask,
  getRecurringTaskById,
  deleteRecurringTask,
  completeRecurringTask,
  createRecurringTaskUpdate,
  getRecurringTaskUpdates,
  deleteRecurringTaskUpdate,
} from "../controllers/recurringTaskController.js";

const router = express.Router();

// ✅ TASK ROUTES
router.get("/recurring-tasks", getAllRecurringTasks);
router.post("/recurring-tasks", createRecurringTask);
router.get("/recurring-tasks/:id", getRecurringTaskById);
router.delete("/recurring-tasks/:id", deleteRecurringTask);
router.put("/recurring-tasks/complete/:id", completeRecurringTask);

// ✅ UPDATE ROUTES
router.post("/recurring-tasks/:taskId/updates", createRecurringTaskUpdate);
router.get("/recurring-tasks/:taskId/updates", getRecurringTaskUpdates);
router.delete("/recurring-tasks/updates/:updateId", deleteRecurringTaskUpdate);

export default router;
