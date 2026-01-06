import { Problem } from "../models/Problem.model.js";
import { Competition } from "../models/Competition.model.js";
import mongoose from "mongoose";

const addProblem = async (req, res) => {
    try {
        const {competitionId} = req.params

        const {
            title,
            statement,
            inputFormat,
            outputFormat,
            constraints,
            difficulty
        } = req.body;

        const userId = req.user.id

        // Validate required fields
        if (
            !title ||
            !statement ||
            !inputFormat ||
            !outputFormat ||
            !difficulty
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided"
            });
        }

        // find competition
        const competition = await Competition.findById(competitionId)
        if (!competition) {
            return res
            .status(404)
            .json({
                success: false,
                message: "Competition not found"
            });
        }

        // owenership check
        if(competition.organizer.toString() !== userId) {
            return res
            .status(403)
            .json({
                success:true,
                message:"Only organizers can add problem"
            })
        }

        // decide marks based on the difficulty
        let marksPerTestCase;
        if(difficulty === 'easy') marksPerTestCase = 5
        else if(difficulty === 'medium') marksPerTestCase = 10
        else if(difficulty === 'hard') marksPerTestCase = 15

        // Create Problem
        const problem = await Problem.create({
            title,
            statement,
            inputFormat,
            outputFormat,
            constraints,
            difficulty,
            marksPerTestCase,
            competition: competitionId
        })

        return res
        .status(201)
        .json({
            success:true,
            message:"Problem added successfully",
            problem
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error while adding problem"
        });
    }
}

const getProblemsByCompetition = async (req, res) => {
    try {
        const { competitionId } = req.params;
        const userId = req.user.id;

        // Check if user is registered in the competition
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
                message: "You must be registered or organizer to access this competition's problems"
            });
        }

        // Find problems for this competition
        const problems = await Problem.find({ competition: competitionId });

        return res.status(200).json({
            success: true,
            problems
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching problems"
        });
    }
};

const getProblemById = async (req, res) => {
    try {
        const { problemId } = req.params;
        const userId = req.user.id;

        // Populate the competition data so frontend can access startTime/endTime
        const problem = await Problem.findById(problemId).populate('competition');

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "Problem not found"
            });
        }

        const competition = problem.competition;

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
                message: "You must be registered or organizer to access this problem"
            });
        }

        return res.status(200).json({
            success: true,
            problem
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching problem"
        });
    }
};

export {addProblem, getProblemsByCompetition, getProblemById}
