import express from "express";
import authMiddleware from '../middlewares/auth.middleware.js';
import isCompetitionOrganizerMiddleware from '../middlewares/isCompetitionOrganizer.middleware.js';

const router = express.Router();

router.post(
    "/competition/:id",
    authMiddleware,
    isCompetitionOrganizerMiddleware,
    (req, res) => {
        res.json({
            success: true,
            message: "Welcome Organizer!"
        });
    }
);

export default router;
