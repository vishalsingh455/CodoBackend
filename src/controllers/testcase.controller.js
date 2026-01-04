import { TestCase } from "../models/TestCase.model.js";
import { Problem } from "../models/Problem.model.js";
import { Competition } from "../models/Competition.model.js";

const addTestCase = async (req, res) => {
    try {
        const {problemId} = req.params
        const userId = req.user.id
    
        const {input, expectedOutput, isHidden} = req.body
    
        if (!input || !expectedOutput) {
            return res.status(400).json({
                success: false,
                message: "Input and expected output are required"
            });
        }
    
        // find problem
        const problem = await Problem.findById(problemId)
    
        if(!problem) {
            return res
            .status(404)
            .json({
                success: false,
                message: "Problem not found"
            });
        }
    
        // find competition
        const competition = await Competition.findById(problem.competition);
    
        // ownership check
        if(competition.organizer.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Only the organizer can add test cases"
            });
        }
    
        // add test case
        const testCase = await TestCase.create({
            input, 
            expectedOutput, 
            isHidden: isHidden || false,
            problem:problemId
        })
    
        return res
        .status(201)
        .json({
            success: true,
            message: "Test case added successfully",
            testCase
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error while adding test case"
        });
    }
}

const getTestCasesByProblem = async (req, res) => {
    try {
        const { problemId } = req.params;
        const userId = req.user.id;
        
        // Check if user has access to the problem (is registered in the competition)
        const testCase = await TestCase.findOne({ problem: problemId });
        if (!testCase) {
            return res.status(200).json({
                success: true,
                testCases: []
            });
        }
        
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "Problem not found"
            });
        }
        
        const competition = await Competition.findById(problem.competition);
        if (!competition) {
            return res.status(404).json({
                success: false,
                message: "Competition not found"
            });
        }
        
        // Check if user is registered in the competition or is the organizer
        const isRegistered = competition.registeredUsers.includes(userId);
        const isOrganizer = competition.organizer.toString() === userId;
        
        if (!isRegistered && !isOrganizer) {
            return res.status(403).json({
                success: false,
                message: "You must be registered or organizer to access test cases"
            });
        }
        
        // Only return visible test cases to participants, all test cases to organizer
        let testCases;
        if (isOrganizer) {
            testCases = await TestCase.find({ problem: problemId });
        } else {
            testCases = await TestCase.find({ problem: problemId, isHidden: false });
        }
        
        return res.status(200).json({
            success: true,
            testCases
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching test cases"
        });
    }
};

export {addTestCase, getTestCasesByProblem}