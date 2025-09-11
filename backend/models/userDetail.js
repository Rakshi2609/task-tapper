import mongoose from 'mongoose';

const userDetailSchema = new mongoose.Schema({
    // 'user' field will store the ObjectId from the 'User' collection.
    // 'ref: "User"' tells Mongoose that this ObjectId refers to documents in the 'User' model.
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // This MUST match the name of your User model
        required: true,
        unique: true // Ensures that each User can only have one UserDetail entry (one-to-one relationship)
    },
    phoneNumber: {
        type: String,
        required: false, // Making phone number optional
        // Example validation for a 10-digit number (adjust regex for international numbers if needed)
        // match: /^\d{10}$/,
        // message: 'Phone number must be 10 digits.'
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'manager', 'guest'], // Define a list of allowed roles
        default: 'user', // Set a default role for new users
        required: true // Role is a mandatory field
    }
}, {
    timestamps: true // Adds createdAt and updatedAt to this schema as well
});

// Export the UserDetail model
export const UserDetail = mongoose.model("UserDetail", userDetailSchema);