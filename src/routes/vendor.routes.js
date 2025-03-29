import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"
import { changeProductStatus, deleteProduct, getAllProduct, getMyProducts, getProductById, registerProduct, updateProduct } from "../controllers/vendor.controller.js";

const router = Router()


router.route("/register-product").post(verifyJWT, 
    upload.fields([
        {
            name: "images",
            maxCount: 1
        }
    ]),
    registerProduct
)
router.route("/get-product").get(verifyJWT, getAllProduct)
router.route("/delete/:productId").delete(verifyJWT, deleteProduct)
router.route("/update/:productId").put(verifyJWT,updateProduct)
router.route("/get/:productId").get(verifyJWT,getProductById)
router.route("/update-status/:productId").put(verifyJWT, changeProductStatus)

export default router