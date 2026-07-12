import express from 'express'
import authUserMiddleware from "../middlewares/auth.middleware.js";
import { submitReport } from '../controllers/report.controller.js';

const router = express.Router()

// Any logged-in user can submit a bug/problem report.
router.post("/reports", authUserMiddleware, submitReport)

export default router