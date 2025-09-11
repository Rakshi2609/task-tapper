import mongoose from "mongoose";

const recurringTaskUpdateSchema = new mongoose.Schema({
    // Reference to the RecurringTask this update belongs to
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RecurringTask", // This links to your 'RecurringTask' model
        required: true,
    },
    // The content of the comment or update
    updateText: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
    },
    // The user who made this update (e.g., their email or username)
    updatedBy: {
        type: String, // Storing email for simplicity
        required: true,
    },
    // Optional: Type of update (e.g., 'comment', 'status_change', 'note')
    updateType: {
        type: String,
        enum: ['comment', 'status_change', 'note', 'other'],
        default: 'comment',
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

export default mongoose.model("RecurringTaskUpdate", recurringTaskUpdateSchema);