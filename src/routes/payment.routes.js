import { addPayment, getPayments, updatePaymentStatus } from "../controllers/payment.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { Router } from "express"

const router = Router()
router.use(verifyJWT)

router.route("/add-payment").post(addPayment)
router.route("/get-payment/:paymentId").get(getPayments)
router.route("/update/:paymentId").patch(updatePaymentStatus)


export default router