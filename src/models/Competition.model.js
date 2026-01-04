import mongoose from "mongoose";
const competitionSchema = new mongoose.Schema(
    {
        title: {
            type:String,
            required:true
        },
        description: String,

        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        roomCode: {
            type: String,
            unique: true,
            required:true
        },

        registeredUsers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        startTime: Date,
        endTime: Date
    },
    { timestamps: true }
);

export const Competition = mongoose.model("Competition", competitionSchema)
