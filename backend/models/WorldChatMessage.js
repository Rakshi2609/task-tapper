// models/WorldChatMessage.js
import mongoose from 'mongoose';

const worldChatMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  message: {
    type: String,
    required: true,
  },
  isSystem: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('WorldChatMessage', worldChatMessageSchema);
