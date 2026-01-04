// start server
import app from "./src/app.js"
import connectDB from "./src/db/db.js"


connectDB()


app.listen(process.env.PORT || 3000, () => {
    console.log("App is listening on port 3000")
})
