import express from 'express'
import { createTask, acceptTask, updateTask, getAllEmails } from "../controllers/team.js";


const router = express.Router();

router.post('/createtask', createTask);
router.post('/accepttask', acceptTask);
router.post('/updatetask', updateTask);
router.get('/email', getAllEmails);

export default router;