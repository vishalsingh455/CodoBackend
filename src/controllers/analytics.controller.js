import { Competition } from "../models/Competition.model.js";
import { Submission } from "../models/Submission.model.js";
import { Problem } from "../models/Problem.model.js";

const getCompetitionAnalytics = async (req, res) => {
    try {
        const { competitionId } = req.params;
        const userId = req.user.id;

        // 1️⃣ Fetch competition
        const competition = await Competition.findById(competitionId);
        if (!competition) {
            return res.status(404).json({
                success: false,
                message: "Competition not found"
            });
        }

        // 2️⃣ Organizer check
        if (competition.organizer.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Organizer only"
            });
        }

        // 3️⃣ Basic stats
        const totalParticipants = competition.registeredUsers.length;

        const totalSubmissions = await Submission.countDocuments({
            competition: competitionId
        });

        const acceptedSubmissions = await Submission.countDocuments({
            competition: competitionId,
            status: "accepted"
        });

        const rejectedSubmissions = await Submission.countDocuments({
            competition: competitionId,
            status: "rejected"
        });

        // 4️⃣ Problem-wise analytics
        const problems = await Problem.find({ competition: competitionId });

        const problemStats = [];

        for (let problem of problems) {
            const totalAttempts = await Submission.countDocuments({
                problem: problem._id
            });

            const accepted = await Submission.countDocuments({
                problem: problem._id,
                status: "accepted"
            });

            problemStats.push({
                problemTitle: problem.title,
                difficulty: problem.difficulty,
                totalAttempts,
                accepted,
                acceptanceRate:
                    totalAttempts === 0
                        ? 0
                        : ((accepted / totalAttempts) * 100).toFixed(2)
            });
        }

        return res.status(200).json({
            success: true,
            analytics: {
                competitionTitle: competition.title,
                totalParticipants,
                totalSubmissions,
                acceptedSubmissions,
                rejectedSubmissions,
                problemStats
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching analytics"
        });
    }
};

export { getCompetitionAnalytics };
