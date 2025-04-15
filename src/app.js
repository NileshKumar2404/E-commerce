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
app.use((req, res, next) => {
    console.log("Received ${req.method} request with body:", req.body);
    console.log("Received ${req.method} request with params:", req.params);
    next();
});

//route declaration
import userRouter from "./routes/user.routes.js"
import adminRouter from "./routes/vendor.routes.js"
import cartRouter from "./routes/cart.routes.js"
import wishlistRouter from "./routes/wishlist.routes.js"
import orderRouter from "./routes/order.routes.js"
import reviewRouter from  "./routes/review.routes.js"
import paymentRouter from "./routes/payment.routes.js"
import notificationRouter from "./routes/notification.routes.js"
import addressRouter from "./routes/address.routes.js"

app.use("/api/v1/user", userRouter)
app.use("/api/v1/admin", adminRouter)
app.use("/api/v1/cart", cartRouter)
app.use("/api/v1/wishlist", wishlistRouter)
app.use("/api/v1/order", orderRouter)
app.use("/api/v1/review", reviewRouter)
app.use("/api/v1/payment", paymentRouter)
app.use("/api/v1/notification", notificationRouter)
app.use("/api/v1/address", addressRouter)

export {app}