import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    fullName: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
    },
    profilePic: {
        type: String,
        default: '',
    },
    forgetPasswordOTP: {
        type: String,
        default: null,
    },
    forgetPasswordOTPExpiry: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;