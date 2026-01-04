import { Submission } from "../models/Submission.model.js";
import { User } from "../models/User.model.js";

const getLeaderboard = async (req, res) => {
    try {
        const { competitionId } = req.params;

        // 1 Fetch all accepted submissions of this competition
        const submissions = await Submission.find({
            competition: competitionId,
            status: "accepted"
        }).populate("user", "name");

        // 2️ Aggregate score per user
        const leaderboardMap = {};

        submissions.forEach(sub => {
            const userId = sub.user._id.toString();
            const problemId = sub.problem.toString();

            if (!leaderboardMap[userId]) {
                leaderboardMap[userId] = {
                    userId,
                    name: sub.user.name,
                    totalScore: 0,
                    problemScores: {},
                    earliestSubmission: sub.createdAt
                };
            }

            // Keep BEST score per problem
            if (
                !leaderboardMap[userId].problemScores[problemId] ||
                leaderboardMap[userId].problemScores[problemId] < sub.score
            ) {
                leaderboardMap[userId].problemScores[problemId] = sub.score;
            }

            // Track earliest submission for tie-breaker
            if (sub.createdAt < leaderboardMap[userId].earliestSubmission) {
                leaderboardMap[userId].earliestSubmission = sub.createdAt;
            }
        });

        const leaderboard = Object.values(leaderboardMap).map(user => {
            const totalScore = Object.values(user.problemScores)
                .reduce((sum, s) => sum + s, 0);

            return {
                userId: user.userId,
                name: user.name,
                totalScore,
                earliestSubmission: user.earliestSubmission
            };
        });

        // Sort leaderboard
        leaderboard.sort((a, b) => {
            if (b.totalScore !== a.totalScore) {
                return b.totalScore - a.totalScore;
            }
            return a.earliestSubmission - b.earliestSubmission;
        });

        return res.status(200).json({
            success: true,
            leaderboard
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching leaderboard"
        });
    }
};

export { getLeaderboard };
