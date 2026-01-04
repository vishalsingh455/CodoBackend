import { Submission } from "../models/Submission.model.js";

const getMyResult = async (req, res) => {
    try {
        const userId = req.user.id
        const { competitionId } = req.params;

        const submissions = await Submission.find({
            competition: competitionId,
            user: userId
        }).populate("problem", "title difficulty marksPerTestCase");

        let totalScore = 0;

        const results = submissions.map(sub => {
            totalScore += sub.score;
            return {
                problemTitle: sub.problem.title,
                difficulty: sub.problem.difficulty,
                score: sub.score,
                status: sub.status,
                submittedAt: sub.createdAt
            };
        });

        return res.status(200).json({
            success: true,
            totalScore,
            results
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error while fetching result"
        });
    }
}

export {getMyResult}