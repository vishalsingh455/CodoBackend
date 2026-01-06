import mongoose from "mongoose";

const problemSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },

        statement: {
            type: String,
            required: true
        },

        inputFormat: {
            type: String,
            required: true
        },

        outputFormat: {
            type: String,
            required: true
        },

        constraints: {
            type: String
        },

        difficulty: {
            type: String,
            enum: ["easy", "medium", "hard"],
            required: true
        },

        marksPerTestCase: {
            type: Number,
            required: true
        },

        competition: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Competition",
            required: true
        }
    },
    { timestamps: true }
);

export const Problem = mongoose.model("Problem", problemSchema);
