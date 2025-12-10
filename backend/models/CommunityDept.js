import mongoose from "mongoose";

const CommunityDeptSchema = new mongoose.Schema({
  // ✅ WHICH COMMUNITY THIS DEPT BELONGS TO
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community",
    required: true,
  },

  // ✅ WHO CREATED THIS DEPT
  CreatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // ✅ MULTIPLE MEMBERS IN HR / TECH / MARKETING
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  ],

  // ✅ DEPARTMENT NAME (HR, TECH, DESIGN)
  name: {
    type: String,
    required: true,
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

  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model("CommunityDept", CommunityDeptSchema);
