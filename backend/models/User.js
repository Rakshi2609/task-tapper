import mongoose from 'mongoose';
import Community from './Community.js';

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
  CommunitysJoined:{
    type: Number,
    default:0,
  },
  CommunitysCreated:{
    type: String,
    default:null,
  },
  Servering:{
    type: String,
    default:null,
  },
  fcmToken: {
    type: String,
  }
});

export default mongoose.model("User", userSchema);
