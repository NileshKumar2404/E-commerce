import express, { urlencoded } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(cookieParser())
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(express.static("public"))

//route declaration
import userRouter from "./routes/user.routes.js"
import adminRouter from "./routes/vendor.routes.js"
import cartRouter from "./routes/cart.routes.js"
import wishlistRouter from "./routes/wishlist.routes.js"

app.use("/api/v1/user", userRouter)
app.use("/api/v1/admin", adminRouter)
app.use("/api/v1/cart", cartRouter)
app.use("/api/v1/wishlist", wishlistRouter)

export {app}