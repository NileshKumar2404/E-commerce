import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { addAddress, getAddress, removeAddress } from "../controllers/address.controller.js";


const router = Router()

router.route("/add-address").post(verifyJWT, addAddress)
router.route("/get-address").get(verifyJWT, getAddress)
router.route("/remove/:addressId").delete(verifyJWT, removeAddress)

export default router