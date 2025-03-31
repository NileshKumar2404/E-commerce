import { addToWishlist, clearWishlist, getUserWishlist, removeFromWishlist } from "../controllers/wishlist.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { Router } from "express"

const router = Router()

router.route("/add-wishlist").post(verifyJWT, addToWishlist)
router.route("/remove-wishlist").put(verifyJWT, removeFromWishlist)
router.route("/get-wishlist").get(verifyJWT, getUserWishlist)
router.route("/clear-wishlist").delete(verifyJWT, clearWishlist)

export default router