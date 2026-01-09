import mongoose from "mongoose";

const passwordResetOTPSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    otp: {
        type: String,
        required: true
    },

    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // TTL index
    }

}, { timestamps: true });

export const PasswordResetOTP = mongoose.model(
    "PasswordResetOTP",
    passwordResetOTPSchema
);
