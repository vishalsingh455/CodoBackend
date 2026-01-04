import express from "express";
import authUserMiddleware from "../middlewares/auth.middleware.js";
import { getCompetitionAnalytics } from "../controllers/analytics.controller.js";

const router = express.Router();

router.get(
    "/competitions/:competitionId/analytics",
    authUserMiddleware,
    getCompetitionAnalytics
);

export default router;
