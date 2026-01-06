// This file handles all competition-related operations
// Like creating competitions, joining them, and managing competition data

import { Competition } from "../models/Competition.model.js"; // Competition database model
import { User } from "../models/User.model.js"; // User database model
import generateRoomCode from "../utils/generateRoomCode.js"; // Function to create unique room codes
import mongoose from "mongoose"; // MongoDB library for database operations

// Function to create a new competition
// This is called when an organizer wants to create a coding competition
const createCompetition = async (req, res) => {
    try {
        // Get competition details from the request (sent by frontend)
        const { title, description, startTime, endTime } = req.body;
        // Get the user ID from the logged-in user (added by auth middleware)
        const userId = req.user.id;

        // Check if required fields are provided
         if(!title || !description) {
            return res
            .status(400) // Bad request status
            .json({
                success:false,
                message:"title and description are required"
            })
         }

        // Generate unique room code - keep trying until we get a unique one
        let roomCode;
        let exists = true;

        while (exists) {
            roomCode = generateRoomCode(); // Creates a random 6-digit number
            exists = await Competition.findOne({ roomCode }); // Check if it already exists
        }

        // Create the competition in the database
        const competition = await Competition.create({
            title,
            description,
            organizer:userId, // The person creating it is the organizer
            roomCode, // Unique code for others to join
            startTime,
            endTime
        })

        // Add this competition to the organizer's list of organized competitions
        await User.findByIdAndUpdate(userId, {
            $push: { organizedCompetitions: competition._id }
        })

        // Send success response back to frontend
        return res.status(201).json({
            success: true,
            message: "Competition created successfully",
            competition // Return the created competition data
        });
    } catch (error) {
        console.error(error); // Log error for debugging
        // Send error response
        return res.status(500).json({
            success: false,
            message: "Server error while creating competition"
        });
    }
}

const joinCompetition = async (req, res) => {
    try {
        const {roomCode} = req.body
        const userId = req.user.id
    
        if(!roomCode) {
            return res
            .status(400)
            .json({
                success:false,
                message:"Room Code is required"
            })
        }
    
        // find competition by room code
    
        const competition = await Competition.findOne({roomCode})
    
        if(!competition) {
            return res.status(404).json({
                success: false,
                message: "Room does not found"
            });
        }
    
        // check if user already joined
        const userObjectId = new mongoose.Types.ObjectId(userId);
        if(competition.registeredUsers.some(id => id.equals(userObjectId))) {
            return res.status(400).json({
                success: false,
                message: "User already joined this competition"
            });
        }

        // add user to competition
        competition.registeredUsers.push(userObjectId)
        await competition.save()
    
        // add competition to user
        await User.findByIdAndUpdate(userId, {
            $push: { registeredCompetitions: competition._id }
        })
    
        return res
        .status(200)
        .json({
            success: true,
            message: "Successfully joined the competition",
            competitionId: competition._id
        });
    } catch (error) {
        console.error(error);
        return res
        .status(500)
        .json({
            success: false,
            message: "Server error while joining competition"
        });
    }
}

const getAllCompetitions = async (req, res) => {
    try {
        const competitions = await Competition.find({})
            .select("title description roomCode startTime endTime");

        return res
        .status(200)
        .json({
            success:true,
            message:"all competitions fetched successfully",
            competitions
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error while fetching competitions"
        });
    }

}

const getMyCompetitions = async (req, res) => {
    try {
        const userId = req.user.id;

        const competitions = await Competition.find({
            organizer: userId
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            competitions
        });
    } catch (error) {
        return res
        .status(500)
        .json({
            success:false,
            message:"Server error while fetching your competitions"
        })
    }
}

const getCompetitionById = async (req, res) => {
    try {
        const { competitionId } = req.params;
        const userId = req.user.id;

        const competition = await Competition.findById(competitionId);
        
        if (!competition) {
            return res.status(404).json({
                success: false,
                message: "Competition not found"
            });
        }

        // Check if user is registered in the competition or is the organizer
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const isRegistered = competition.registeredUsers.some(id => id.equals(userObjectId));
        const isOrganizer = competition.organizer.toString() === userId;
        
        if (!isRegistered && !isOrganizer) {
            return res.status(403).json({
                success: false,
                message: "You must be registered or organizer to access this competition"
            });
        }

        return res.status(200).json({
            success: true,
            competition
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching competition"
        });
    }
};

const submitCompetition = async (req, res) => {
    try {
        const { competitionId } = req.params;
        const userId = req.user.id;

        const competition = await Competition.findById(competitionId);

        if (!competition) {
            return res.status(404).json({
                success: false,
                message: "Competition not found"
            });
        }

        // Check if user is registered
        const userObjectId = new mongoose.Types.ObjectId(userId);
        if (!competition.registeredUsers.some(id => id.equals(userObjectId))) {
            return res.status(403).json({
                success: false,
                message: "You are not registered for this competition"
            });
        }

        // Check if competition has ended
        const now = new Date();
        const endTime = new Date(competition.endTime);
        if (now < endTime) {
            return res.status(400).json({
                success: false,
                message: "Competition is still ongoing. You can only submit after it ends."
            });
        }

        // Mark competition as submitted for this user
        // You could add a field to track submitted users, or just return success
        // For now, we'll just return success as the submission is complete

        return res.status(200).json({
            success: true,
            message: "Competition submitted successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error while submitting competition"
        });
    }
};

export {createCompetition, joinCompetition, getAllCompetitions, getMyCompetitions, getCompetitionById, submitCompetition}
