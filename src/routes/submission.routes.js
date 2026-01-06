import express from 'express'
import authUserMiddleware from "../middlewares/auth.middleware.js";
import { submitCode, runCode, getMySubmissions } from '../controllers/submission.controller.js';

const router = express.Router()

router.post("/problems/:problemId/submit", authUserMiddleware, submitCode)
router.post("/problems/:problemId/run", authUserMiddleware, runCode)
router.get("/my-submissions", authUserMiddleware, getMySubmissions)

export default router
