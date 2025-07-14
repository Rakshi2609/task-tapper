// backend/socket/worldChat.js
import User from '../models/User.js';
import WorldChatMessage from '../models/WorldChatMessage.js';

export const setupWorldChat = (io) => {
  io.on('connection', async (socket) => {
    console.log(`🌍 [World Chat] Connected: ${socket.id}`);

    // 1. Send last 50 messages (newest last)
    const messages = await WorldChatMessage.find({})
      .sort({ timestamp: -1 })
      .limit(50)
      .populate('userId', 'username');

    const formattedMessages = messages.reverse().map((msg) => ({
      _id: msg._id,
      userId: msg.userId?._id || null,
      username: msg.userId?.username || 'System',
      message: msg.message,
      isSystem: msg.isSystem || false,
      timestamp: msg.timestamp,
    }));

    socket.emit('world-chat-init', formattedMessages);

    // 2. Handle incoming user messages
    socket.on('world-chat-message', async ({ userId, message }) => {
      if (!userId || !message?.trim()) return;

      const user = await User.findById(userId);
      if (!user) return;

      const newMsg = await WorldChatMessage.create({ userId, message });

      const broadcastMsg = {
        _id: newMsg._id,
        userId: user._id,
        username: user.username,
        message: newMsg.message,
        isSystem: false,
        timestamp: newMsg.timestamp,
      };

      io.emit('world-chat-message', broadcastMsg);
    });

    socket.on('disconnect', () => {
      console.log(`👋 [World Chat] Disconnected: ${socket.id}`);
    });
  });
};

export const emitSystemMessage = async (io, messageText) => {
  const newMsg = await WorldChatMessage.create({
    message: messageText,
    isSystem: true, // ✅ stored in DB
  });

  io.emit('world-chat-message', {
    _id: newMsg._id,
    message: newMsg.message,
    isSystem: true,
    timestamp: newMsg.timestamp,
    username: 'System',
  });
};
