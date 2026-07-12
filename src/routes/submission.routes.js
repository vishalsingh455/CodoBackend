// import express from 'express'
// import authUserMiddleware from "../middlewares/auth.middleware.js";
// import { submitCode, runCode, getMySubmissions } from '../controllers/submission.controller.js';

// const router = express.Router()

// router.post("/problems/:problemId/submit", authUserMiddleware, submitCode)
// router.post("/problems/:problemId/run", authUserMiddleware, runCode)
// router.get("/my-submissions", authUserMiddleware, getMySubmissions)

// export default router



import express from 'express'
import authUserMiddleware from "../middlewares/auth.middleware.js";
import { submitCode, runCode, getMySubmissions, getSubmissionStatus } from '../controllers/submission.controller.js';

const router = express.Router()

router.post("/problems/:problemId/submit", authUserMiddleware, submitCode)
router.post("/problems/:problemId/run", authUserMiddleware, runCode)
router.get("/my-submissions", authUserMiddleware, getMySubmissions)

// New: poll a single submission's live status/result while it sits in the
// queue or is being evaluated. Since this router is mounted at '/api' in
// app.js, this becomes GET /api/submission/:id exactly as requested.
router.get("/submission/:id", authUserMiddleware, getSubmissionStatus)

export default router