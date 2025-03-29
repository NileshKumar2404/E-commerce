import dotenv from 'dotenv'
import {app} from "./app.js"
import connectDB from "./db/index.js"

dotenv.config({
    path: './.env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log("Server is running on port: ", process.env.PORT);
    })
    app.on('error', (error) => {
        console.log("Server error: ", error);
        process.exit(1)
    })
})

.catch((err) => {
    console.log("MongoDB connection error!!!", err);
})