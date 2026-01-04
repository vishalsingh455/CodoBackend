import express from "express";
import { addProblem, getProblemsByCompetition, getProblemById } from "../controllers/problem.controller.js";
import authUserMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router()

router.post('/competitions/:competitionId/problems', authUserMiddleware, addProblem)
router.get('/problems/competition/:competitionId', authUserMiddleware, getProblemsByCompetition)
router.get('/problems/:problemId', authUserMiddleware, getProblemById)

export default router
