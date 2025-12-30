import mongoose from "mongoose";
import CommumityDept from "./CommunityDept.js";
import Community from "./Community.js";

const teamSchema = new mongoose.Schema({
  createdBy: String,
  taskName: String,
  taskDescription: String,
  assignedTo: String,
  assignedName: String,
  communityDept: {
    type: mongoose.Schema.Types.ObjectId,
    ref: CommumityDept,
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Community,
  },
  taskFrequency: {
    type: String,
    enum:['Daily', 'Weekly', 'Monthly', 'OneTime'],
    default: 'OneTime',
  },
  dueDate: {
    type: Date,
    default: Date.now,
  },
  priority: String,
  completedDate: Date,
  startTime: {
    type: Date,
    required: false,
  },
  endTime: {
    type: Date,
    required: false,
  },
  recurringTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecurringTask',
    required: false,
  },
});

export default mongoose.model("Team", teamSchema);
