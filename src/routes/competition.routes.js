import express from "express";
import authUserMiddleware from "../middlewares/auth.middleware.js";
import { createCompetition, joinCompetition, getMyCompetitions, getCompetitionById, submitCompetition } from "../controllers/competition.controller.js";
import { getCompetitionSubmissions } from "../controllers/competitionSubmissions.controller.js";

const router = express.Router()

router.post('/create', authUserMiddleware, createCompetition)
router.post('/join', authUserMiddleware, joinCompetition)

router.get(
    "/:competitionId/submissions",
    authUserMiddleware,
    getCompetitionSubmissions
);

router.get('/my-competitions', authUserMiddleware, getMyCompetitions)

router.get('/:competitionId', authUserMiddleware, getCompetitionById)

router.post('/:competitionId/submit', authUserMiddleware, submitCompetition)

export default router
