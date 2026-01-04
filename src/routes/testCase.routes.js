import express from "express";
import { addProblem } from "../controllers/problem.controller.js";
import authUserMiddleware from "../middlewares/auth.middleware.js";
import { addTestCase, getTestCasesByProblem } from "../controllers/testcase.controller.js";

const router = express.Router()

router.post("/problems/:problemId/testcases", authUserMiddleware, addTestCase)
router.get("/problems/:problemId/testcases", authUserMiddleware, getTestCasesByProblem)

export default router
