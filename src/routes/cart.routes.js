import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { addToCart, updateQuantity, removeProduct, getCart, clearCart } from "../controllers/cart.controller.js";

const router = Router()
router.route("/add-cart").post(verifyJWT, addToCart)
router.route("/remove/:productId").delete(verifyJWT, removeProduct)
router.route("/update-quantity").delete(verifyJWT, updateQuantity)
router.route("/get-cart").get(verifyJWT, getCart)
router.route("/clear").delete(verifyJWT, clearCart)

export default router