import { Router } from "express";
import { changeCurrentPassword, getAllUsers, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails } from "../controllers/user.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"


const router = Router()

router.route("/register-user").post(registerUser)
router.route("/login-user").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/update-details").patch(verifyJWT, updateAccountDetails)
router.route("/refreshAccessToken").post(verifyJWT, refreshAccessToken)
router.route("/get-user").get(verifyJWT, getAllUsers)

export default router