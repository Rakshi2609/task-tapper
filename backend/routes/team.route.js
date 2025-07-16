import express from 'express'
import { createTask, updateTask, getAllEmails, deleteTask} from "../controllers/team.js";


const router = express.Router();

router.post('/createtask', createTask);
router.post('/updatetask', updateTask);
router.post('/deletetask', deleteTask);
router.get('/email', getAllEmails);

export default router;