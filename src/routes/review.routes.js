import { addReview, deleteReview, getAllReviews, getReview, updateReview } from "../controllers/review.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { Router } from "express"

const router = Router()

router.route("/add-review").post(verifyJWT, addReview)
router.route("/update/:reviewId").patch(verifyJWT, updateReview)
router.route("/get-review/:productId").get(verifyJWT, getReview)
router.route("/delete/:reviewId").delete(verifyJWT, deleteReview)
router.route("/get-all-review").get(verifyJWT, getAllReviews)

export default router