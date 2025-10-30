import express from 'express';
import WorldChatMessage from '../models/WorldChatMessage.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/chat/messages
router.get('/messages', async (req, res) => {
  try {
    const rawLimit = parseInt(req.query.limit ?? '20', 10);
    const limit = Math.min(Math.max(rawLimit || 20, 1), 100); // clamp 1..100

    const beforeRaw = req.query.before;
    let filter = {};
    if (beforeRaw) {
      const beforeDate = new Date(beforeRaw);
      if (!isNaN(beforeDate.getTime())) {
        filter.timestamp = { $lt: beforeDate };
      }
    }

    const messages = await WorldChatMessage.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('userId', 'username');

    // Oldest -> newest for UI
    const formatted = messages
      .reverse()
      .map((msg) => ({
        _id: msg._id,
        userId: msg.userId ? msg.userId._id : null,
        username: msg.userId?.username || 'System',
        message: msg.message,
        isSystem: !!msg.isSystem,
        timestamp: msg.timestamp,
      }));

    res.json(formatted);
  } catch (err) {
    console.error('❌ Error fetching chat messages:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
