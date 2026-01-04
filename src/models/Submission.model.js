import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        problem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Problem",
            required: true
        },

        competition: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Competition",
            required: true
        },

        code: {
            type: String,
            required: true
        },

        language: {
            type: String,
            enum: ["c", "cpp", "java", "python", "javascript"],
            required: true
        },

        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending"
        },

        score: {
            type: Number,
            default: 0
        },

        error: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

export const Submission = mongoose.model("Submission", submissionSchema);
