import express from 'express'
import { createTask, updateTask, getAllEmails, deleteTask, getTaskById, createTaskUpdate, getTaskUpdates} from "../controllers/team.js";


const router = express.Router();

router.post('/createtask', createTask);
router.post('/updatetask', updateTask);
router.post('/deletetask', deleteTask);
router.get('/email', getAllEmails);
router.get('/tasks/:taskId', getTaskById); // <-- Route to get a single task
router.post('/tasks/:taskId/updates', createTaskUpdate);
router.get('/tasks/:taskId/updates', getTaskUpdates);

export default router;