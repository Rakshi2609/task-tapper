import mongoose from 'mongoose';

const recurringTaskSchema = new mongoose.Schema({
  taskName: {
    type: String,
    required: true,
    maxlength: 55
  },
  taskDescription: {
    type: String,
    maxlength: 255
  },
  taskFrequency: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly'],
    required: true
  },
  taskCreateDaysAhead: {
    type: Number,
    required: true,
  },
  taskStartDate: {
    type: Date,
    required: true
  },
  taskEndDate: {
    type: Date,
    default: null
  },
  completedDate: {
    type: Date,
    default: null
  },
  taskAssignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    default: null
  },
  taskAssignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdBy: {
    type: String,
    required: true,
    maxlength: 50
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const RecurringTask = mongoose.model('RecurringTask', recurringTaskSchema);
export default RecurringTask;
