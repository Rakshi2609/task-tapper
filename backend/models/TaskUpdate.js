import mongoose from "mongoose";

const taskUpdateSchema = new mongoose.Schema({
    // Reference to the Team task this update belongs to
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team", // This links to your 'Team' model
        required: true,
    },
    // The content of the comment or update
    updateText: {
        type: String,
        required: true,
        trim: true, // Remove whitespace from both ends of a string
        minlength: 1, // Ensure the comment is not empty
    },
    // The user who made this update (e.g., their email or username)
    // You might want to reference your User model here as well if you have user IDs.
    updatedBy: {
        type: String, // Storing email for simplicity, consider a ref to User model's _id if appropriate
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

export default mongoose.model("TaskUpdate", taskUpdateSchema);
