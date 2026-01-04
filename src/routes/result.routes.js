import express from "express";
import authUserMiddleware from "../middlewares/auth.middleware.js";
import { getMyResult } from "../controllers/result.controller.js";

const router = express.Router()

router.get(
    "/competitions/:competitionId/my-result",
    authUserMiddleware,
    getMyResult
);
export default router