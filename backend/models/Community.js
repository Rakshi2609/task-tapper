import mongoose from "mongoose";

const CommunitySchema = new mongoose.Schema({
  CreatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  ],

  name: {
    type: String,
    required: true,
    unique: true,
  },

  description: {
    type: String,
    required: true,
  },

  totalMembers: {
    type: Number,
    default: 0,
  },

  totalTasks: {
    type: Number,
    default: 0,
  },

  waitingApproval: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
});

export default mongoose.model("Community", CommunitySchema);
