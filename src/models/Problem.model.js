import mongoose from "mongoose";

const problemSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },

        description: {
            type: String,
            required: true
        },

        functionName: {
            type: String,
            required: true
        },

        returnType: {
            type: String,
            required: true
        },

        parameters: [{
            name: {
                type: String,
                required: true
            },
            type: {
                type: String,
                required: true
            }
        }],

        starterTemplates: {
            type: Object,
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
