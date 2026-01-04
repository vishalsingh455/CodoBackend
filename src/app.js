// This is the main server file for the Codo coding competition platform
// It sets up the Express server and connects all the different parts of the application

import express from "express"; // Express is a web framework for Node.js
import dotenv from 'dotenv' // Loads environment variables from .env file
import cors from 'cors' // Allows requests from different websites (frontend to backend)
import authRoutes from './routes/auth.routes.js' // Routes for login/register
import testRoutes from './routes/test.routes.js' // Test routes (probably for development)
import cookieParser from "cookie-parser"; // Helps read cookies from requests
import competitionRoutes from './routes/competition.routes.js' // Routes for competitions
import userRoutes from './routes/user.routes.js' // Routes for user management
import authUserMiddleware from "./middlewares/auth.middleware.js"; // Checks if user is logged in
import { getAllCompetitions } from "./controllers/competition.controller.js"; // Function to get all competitions
import problemRoutes from './routes/problem.routes.js' // Routes for coding problems
import testCaseRoutes from './routes/testCase.routes.js' // Routes for test cases
import submissionRoutes from './routes/submission.routes.js' // Routes for code submissions
import leaderboardRoutes from './routes/leaderboard.routes.js' // Routes for competition rankings
import resultRoutes from './routes/result.routes.js' // Routes for results
import analyticsRoutes from './routes/analytics.routes.js' // Routes for analytics/statistics

// Load environment variables (like database passwords, API keys)
dotenv.config()

// Create the main Express application
const app = express()

// Middleware setup (these run on every request)
// Allow requests from frontend (localhost:5173 and 5174 are common dev ports)
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true // Allow cookies to be sent
}));

// Parse JSON data from requests
app.use(express.json())

// Parse cookies from requests
app.use(cookieParser())

// Route setup - connect URL paths to their handlers
// When someone visits /api/auth, use the auth routes
app.use('/api/auth', authRoutes)

// Test routes for development
app.use("/api/test", testRoutes);

// Competition related routes (/api/competitions/*)
app.use('/api/competitions', competitionRoutes)

// User management routes
app.use('/api/user', userRoutes)

// Problem management routes
app.use('/api', problemRoutes)

// Test case management routes
app.use('/api', testCaseRoutes)

// Code submission routes
app.use('/api', submissionRoutes)

// Leaderboard routes
app.use('/api', leaderboardRoutes)

// Result routes
app.use("/api", resultRoutes)

// Analytics routes
app.use("/api", analyticsRoutes)

// Export the app so it can be started in server.js
export default app
