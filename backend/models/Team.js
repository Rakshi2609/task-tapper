import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  createdBy: String,
  task: String,
  assignedTo: String,
  assignedName: String,
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
});

export default mongoose.model("Team", teamSchema);
