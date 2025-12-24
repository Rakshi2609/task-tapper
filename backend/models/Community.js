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

  memberEmailStatus: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      emailSent: {
        type: Boolean,
        default: false,
      },
      sentAt: {
        type: Date,
      },
      emailType: {
        type: String,
        enum: ['welcome', 'approved', 'rejected'],
      }
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
