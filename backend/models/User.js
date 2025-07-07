import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  TasksAssigned:{
    type: Number,
    default: 0,
  },
  TasksCompleted:{
    type: Number,
    default:0,
  },
  TasksInProgress:{
    type: Number,
    default:0,
  },
  TasksNotStarted:{
    type: Number,
    default:0,
  },
  Attendence:{
    type: Number,
  },
  fcmToken: {
    type: String,
  }
});

export default mongoose.model("User", userSchema);
