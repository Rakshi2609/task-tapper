import express from 'express'
import {glogin, gsignup} from '../controllers/auth.js'
import { getUserProfile, getUserTasks, getAssignedByMe, getUserDetail} from '../controllers/auth.js';
import User from '../models/User.js'

const router = express.Router();

router.post('/login', glogin);
router.post('/signup', gsignup);
router.post('/user-detail', getUserDetail); // Example route

router.get('/profile/:email', getUserProfile);
router.get('/tasks/:email', getUserTasks);
router.get('/assignedByMe', getAssignedByMe);
// router.post('/save-token', async (req, res) => {
//   const { email, fcmToken } = req.body;
//   try {
//     const user = await User.findOneAndUpdate({ email }, { fcmToken });
//     res.status(200).json({ success: true });
//   } catch (err) {
//     res.status(500).json({ success: false });
//   }

// });


export default router;