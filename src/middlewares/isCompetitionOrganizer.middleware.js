import { Competition } from "../models/Competition.model.js";

const isCompetitionOrganizerMiddleware = async (req, res, next) => {
    try {
        const competitionId = req.params.id
        const userId = req.user.id

        const competition = await Competition.findById(competitionId)

        if(!competition) {
            return res
            .status(404)
            .json({
                success: false,
                message: "Competition not found"
            });
        }

        if(competition.organizer.toString() !== userId) {
            return res
            .status(403)
            .json({
                success: false,
                message: "Access denied. You are not the organizer of this competition"
            });
        }

        //attach competition for reuse
        req.competition = competition
        next()
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Server error while checking competition organizer ${error}`
        });
    }

}

export default isCompetitionOrganizerMiddleware