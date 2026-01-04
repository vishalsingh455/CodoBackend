import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { getLeaderboard } from "../controllers/leaderboard.controller.js";

const router = express.Router();

router.get(
    "/competitions/:competitionId/leaderboard",
    authMiddleware,
    getLeaderboard
);

export default router;
