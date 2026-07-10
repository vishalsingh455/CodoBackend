// start server
//import app from "./src/app.js"

// For Vercel serverless deployment
//export default app

// For local development (uncomment if needed)
// app.listen(process.env.PORT || 3000, () => {
//     console.log("App is listening on port 3000")
// })
// start server
import app from "./src/app.js"

// For Vercel serverless deployment
export default app

// ACTIVELY LISTEN FOR TRAFFIC ON AWS
app.listen(process.env.PORT || 3000, "0.0.0.0", () => {
     console.log("App is listening on port 3000")
})
