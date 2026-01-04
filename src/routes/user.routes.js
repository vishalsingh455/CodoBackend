import express from 'express'
import authUserMiddleware from '../middlewares/auth.middleware.js'
import { getUserDashboard } from '../controllers/user.controller.js'
import { getAllCompetitions } from '../controllers/competition.controller.js'

const router = express.Router()

router.get('/dashboard', authUserMiddleware, getUserDashboard)
router.get('/all-competitions', authUserMiddleware, getAllCompetitions)

export default router