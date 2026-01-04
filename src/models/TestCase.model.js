import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema(
    {
        input: {
            type: String,
            required: true
        },

        expectedOutput: {
            type: String,
            required: true
        },

        isHidden: {
            type: Boolean,
            default: false
        },

        problem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Problem",
            required: true
        }
    },
    { timestamps: true }
);

export const TestCase = mongoose.model("TestCase", testCaseSchema);
