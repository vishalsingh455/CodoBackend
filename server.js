// start server
import app from "./src/app.js"

// For Vercel serverless deployment
export default app

// For local development (uncomment if needed)
// app.listen(process.env.PORT || 3000, () => {
//     console.log("App is listening on port 3000")
// })
