import { cancelOrder, getAllOrders, getUserOrders, placeOrder, updateOrderStatus } from "../controllers/order.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router()

router.route("/place-order").post(verifyJWT, placeOrder)
router.route("/get-orders").get(verifyJWT, getUserOrders)
router.route("/get-all-orders").get(verifyJWT, getAllOrders)
router.route("/update/:orderId").patch(verifyJWT, updateOrderStatus)
router.route("/cancel-order/:orderId").delete(verifyJWT, cancelOrder)

export default router