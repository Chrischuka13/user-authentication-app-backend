import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "please provide a username"],
    },
    email: {
        type: String,
        required: [true, "please provide an email"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "please provide a password"]
    },
    isVerified: {
        type: Boolean,
        default: false,
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date,
    verifyToken: String,
    verifyTokenExpires: Date,

    createdAt: {
        type: Date,
        default: Date.now,
    }
})

export default mongoose.model("myUser", userSchema);