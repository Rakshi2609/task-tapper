import express from 'express';
import WorldChatMessage from '../models/WorldChatMessage.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/chat/messages
router.get('/messages', async (req, res) => {
  try {
    const { before = new Date().toISOString(), limit = 20 } = req.query;

    const messages = await WorldChatMessage.find({
      timestamp: { $lt: new Date(before) }
    })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'username');

    const formatted = messages.reverse().map((msg) => ({
      _id: msg._id,
      userId: msg.userId._id,
      username: msg.userId.username,
      message: msg.message,
      timestamp: msg.timestamp
    }));

    res.json(formatted); // ✅ Return array directly
  } catch (err) {
    console.error('❌ Error fetching chat messages:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
