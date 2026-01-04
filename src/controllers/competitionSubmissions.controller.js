import { Submission } from "../models/Submission.model.js";
import { Competition } from "../models/Competition.model.js";

const getCompetitionSubmissions = async (req, res) => {
    try {
        const {competitionId} = req.params
        const userId = req.user.id

        const competition = await Competition.findById(competitionId)
        if (!competition) {
            return res.status(404).json({
                success: false,
                message: "Competition not found"
            });
        }

        if (competition.organizer.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Only organizer can view submissions"
            });
        }

        const submissions = await Submission.find({
            competition:competitionId
        })
            .populate("user", "name email")
            .populate("problem", "title difficulty")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            submissions
        });
    } catch (error) {
        return res.status(200).json({
            success: true,
            submissions
        });
    }
}

export {getCompetitionSubmissions}