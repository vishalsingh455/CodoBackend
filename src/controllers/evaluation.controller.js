import { Submission } from "../models/Submission.model.js";
import { Problem } from "../models/Problem.model.js";
import { TestCase } from "../models/TestCase.model.js";
import { executeSubmission } from "./execution.controller.js";

const evaluateSubmission = async (submissionId) => {
    try {
        // fetch submission
        const submission = await Submission.findById(submissionId)
        if(!submission) return

        //fetch problem
        const problem = await Problem.findById(submission.problem)

        // fetch test cases
        const testCases = await TestCase.find({
            problem:submission.problem
        })

        // execute code
        const result = await executeSubmission(
            submission,
            testCases
        );

        // calculate score
        const score = result.passed * problem.marksPerTestCase;

        // decide status
        const status = result.passed === testCases.length ? "accepted" : "rejected";

        //update submission
        submission.score = score;
        submission.status = status;
        submission.error = result.error || "";
        await submission.save();
    } catch (error) {
        console.log("Error while evaluation of code")
    }
}

export {evaluateSubmission}
