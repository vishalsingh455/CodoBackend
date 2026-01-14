import express from "express";
import { analyzeCode } from "../controllers/analyzeCode.controller.js";
import authUserMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router()

router.post("/ai/analyze-complexity", authUserMiddleware, analyzeCode)

export default router