import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: true
        },

        // role: {
        //     type: String,
        //     enum: ["participant", "organizer"],
        //     default: "participant"
        // },

        registeredCompetitions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Competition"
            }
        ],

        organizedCompetitions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Competition"
            }
        ]
    },
    { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
