// import { Submission } from "../models/Submission.model.js";
// import { Problem } from "../models/Problem.model.js";
// import { Competition } from "../models/Competition.model.js";
// import { TestCase } from "../models/TestCase.model.js";
// import { evaluateSubmission } from "./evaluation.controller.js";
// import { executeSubmission } from "./execution.controller.js";

// const submitCode = async (req, res) => {
//     try {
//         const { problemId } = req.params
//         const userId = req.user.id
//         const { code, language } = req.body

//         if (!code || !language) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Code and language are required"
//             });
//         }

//         //find problem
//         const problem = await Problem.findById(problemId)

//         if (!problem) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Problem not found"
//             });
//         }

//         // find competition
//         const competition = await Competition.findById(problem.competition)

//         // check if user joined a competition or not
//         if (!competition.registeredUsers.includes(userId)) {
//             return res
//                 .status(403)
//                 .json({
//                     success: false,
//                     message: "You must join the competition before submitting"
//                 });
//         }

//         // create submission

//         const submission = await Submission.create({
//             user: userId,
//             problem: problemId,
//             competition: competition._id,
//             code,
//             language,
//             status: "pending"
//         })

//         // eavluate submission
//         await evaluateSubmission(submission._id)

//         return res
//             .status(201)
//             .json({
//                 success: true,
//                 message: "Code submitted successfully",
//                 submissionId: submission._id
//             });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             success: false,
//             message: "Server error while submitting code"
//         });
//     }
// }

// const runCode = async (req, res) => {
//     try {
//         const { problemId } = req.params
//         const userId = req.user.id
//         const { code, language } = req.body

//         if (!code || !language) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Code and language are required"
//             });
//         }

//         //find problem
//         const problem = await Problem.findById(problemId)

//         if (!problem) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Problem not found"
//             });
//         }

//         // find competition
//         const competition = await Competition.findById(problem.competition)

//         // check if user joined a competition or not
//         if (!competition.registeredUsers.includes(userId)) {
//             return res
//                 .status(403)
//                 .json({
//                     success: false,
//                     message: "You must join the competition before running code"
//                 });
//         }

//         // Get only visible (public) test cases
//         const visibleTestCases = await TestCase.find({
//             problem: problemId,
//             isHidden: false
//         });

//         if (visibleTestCases.length === 0) {
//             return res.status(200).json({
//                 success: true,
//                 message: "No visible test cases available",
//                 passed: 0,
//                 total: 0,
//                 results: []
//             });
//         }

//         // Create a mock submission object for execution
//         const mockSubmission = {
//             language,
//             code,
//             problem: problemId
//         };

//         // Execute code against visible test cases only
//         const result = await executeSubmission(mockSubmission, visibleTestCases, problem);

//         return res.status(200).json({
//             success: true,
//             message: "Code executed successfully",
//             passed: result.passed,
//             total: visibleTestCases.length,
//             error: result.error
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             success: false,
//             message: "Server error while running code"
//         });
//     }
// }

// const getMySubmissions = async (req, res) => {
//     try {
//         const userId = req.user.id

//         const submissions = await Submission.find({
//             user: userId
//         })
//             .populate("problem", "title difficulty")
//             .populate("competition", "title")
//             .sort({ createdAt: -1 });

//         return res.status(200).json({
//             success: true,
//             submissions
//         });
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: "Server error while fetching submissions"
//         });
//     }
// }

// export { submitCode, runCode, getMySubmissions }




import { Submission } from "../models/Submission.model.js";
import { Problem } from "../models/Problem.model.js";
import { Competition } from "../models/Competition.model.js";
import { TestCase } from "../models/TestCase.model.js";
import { evaluateSubmission } from "./evaluation.controller.js";
import { executeSubmission } from "./execution.controller.js";
import submissionQueue from "../execution/submissionQueue.js";

const submitCode = async (req, res) => {
    try {
        const { problemId } = req.params
        const userId = req.user.id
        const { code, language } = req.body

        if (!code || !language) {
            return res.status(400).json({
                success: false,
                message: "Code and language are required"
            });
        }

        //find problem
        const problem = await Problem.findById(problemId)

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "Problem not found"
            });
        }

        // find competition
        const competition = await Competition.findById(problem.competition)

        // check if user joined a competition or not
        if (!competition.registeredUsers.includes(userId)) {
            return res
                .status(403)
                .json({
                    success: false,
                    message: "You must join the competition before submitting"
                });
        }

        // Guard: prevent duplicate/spam submissions for the SAME problem
        // while a previous one from this user is still queued or running.
        // Scoped per-problem (not per-user globally) so submitting to a
        // different problem while one is pending elsewhere is still fine.
        const existingPending = await Submission.findOne({
            user: userId,
            problem: problemId,
            status: { $in: ["queued", "processing"] }
        });

        if (existingPending) {
            return res.status(409).json({
                success: false,
                message: "You already have a submission being evaluated for this problem. Please wait for it to finish.",
                submissionId: existingPending._id
            });
        }

        // create submission — starts as "queued" instead of running Docker
        // synchronously inside this request. This is what lets the request
        // return instantly instead of blocking the EC2 process while Docker runs.
        const submission = await Submission.create({
            user: userId,
            problem: problemId,
            competition: competition._id,
            code,
            language,
            status: "queued"
        })

        // Push the actual evaluation onto the shared, concurrency-1 queue.
        // Deliberately NOT awaited here — that's the whole point. The HTTP
        // response goes out immediately; the job runs whenever the queue
        // gets to it (possibly after other students' submissions ahead of it).
        submissionQueue.enqueue(async () => {
            // Mark as "processing" the moment Docker actually starts on it,
            // so polling clients can distinguish "waiting in line" from
            // "running right now".
            try {
                submission.status = "processing";
                await submission.save();
            } catch (err) {
                console.error("Failed to mark submission as processing:", err.message || err);
            }

            await evaluateSubmission(submission._id);
        }).catch(async (error) => {
            // Safety net: evaluateSubmission already catches its own errors
            // internally, so this branch should rarely fire. It exists so
            // that ANY unexpected throw in the queued job (e.g. a DB error
            // right before evaluateSubmission runs) still resolves the
            // submission instead of leaving it stuck at "queued"/"processing"
            // forever.
            console.error("Queued submission job failed:", error?.message || error);
            try {
                await Submission.findByIdAndUpdate(submission._id, {
                    status: "rejected",
                    error: "Internal error while processing submission"
                });
            } catch (updateErr) {
                console.error("Failed to update submission after queue failure:", updateErr.message || updateErr);
            }
        });

        // 202 Accepted: request understood, work is queued, not finished yet.
        return res
            .status(202)
            .json({
                success: true,
                message: "Code submitted successfully and queued for evaluation",
                submissionId: submission._id
            });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error while submitting code"
        });
    }
}

const runCode = async (req, res) => {
    try {
        const { problemId } = req.params
        const userId = req.user.id
        const { code, language } = req.body

        if (!code || !language) {
            return res.status(400).json({
                success: false,
                message: "Code and language are required"
            });
        }

        //find problem
        const problem = await Problem.findById(problemId)

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "Problem not found"
            });
        }

        // find competition
        const competition = await Competition.findById(problem.competition)

        // check if user joined a competition or not
        if (!competition.registeredUsers.includes(userId)) {
            return res
                .status(403)
                .json({
                    success: false,
                    message: "You must join the competition before running code"
                });
        }

        // Get only visible (public) test cases
        const visibleTestCases = await TestCase.find({
            problem: problemId,
            isHidden: false
        });

        if (visibleTestCases.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No visible test cases available",
                passed: 0,
                total: 0,
                results: []
            });
        }

        // Create a mock submission object for execution
        const mockSubmission = {
            language,
            code,
            problem: problemId
        };

        // Execute code against visible test cases only — routed through the
        // same concurrency-1 queue as submissions, so "Run" clicks can never
        // pile up alongside real submissions and spike memory. We still
        // await the result here, so this endpoint's behavior/response shape
        // is unchanged from the caller's point of view; it just waits its
        // turn if the queue is busy.
        const result = await submissionQueue.enqueue(() =>
            executeSubmission(mockSubmission, visibleTestCases, problem)
        );

        return res.status(200).json({
            success: true,
            message: "Code executed successfully",
            passed: result.passed,
            total: visibleTestCases.length,
            error: result.error
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error while running code"
        });
    }
}

const getMySubmissions = async (req, res) => {
    try {
        const userId = req.user.id

        const submissions = await Submission.find({
            user: userId
        })
            .populate("problem", "title difficulty")
            .populate("competition", "title")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            submissions
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error while fetching submissions"
        });
    }
}

// Lightweight polling endpoint for a single submission's current state.
// Frontend calls this repeatedly (e.g. every 1-2s) after getting a
// submissionId back from submitCode, until status is "accepted" or "rejected".
const getSubmissionStatus = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.user.id

        const submission = await Submission.findById(id)
            .populate("problem", "title difficulty marksPerTestCase")
            .populate("competition", "title")

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: "Submission not found"
            });
        }

        // Only the owner can poll their own submission's status.
        if (submission.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this submission"
            });
        }

        return res.status(200).json({
            success: true,
            submission: {
                _id: submission._id,
                status: submission.status,
                score: submission.score,
                error: submission.error,
                language: submission.language,
                problem: submission.problem,
                competition: submission.competition,
                createdAt: submission.createdAt,
                updatedAt: submission.updatedAt
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching submission status"
        });
    }
}

export { submitCode, runCode, getMySubmissions, getSubmissionStatus }