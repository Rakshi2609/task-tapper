import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  createdBy: String,            
  task: String,                 
  dueDate: {
    type: Date,
    default: Date.now,
  },
  priority: String,
  completedDate: Date,

  members: [
    {
      email: String,            
      name: String,             
      accepted: {
        type: Boolean,
        default: false,        
      },
      progress: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed'],
        default: 'Not Started',
      },
    }
  ]
});
