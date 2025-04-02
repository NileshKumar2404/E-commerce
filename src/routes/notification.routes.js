import { deleteNotifications, getNotifications, markNotificationAsRead, sendNotifications } from "../controllers/notification.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { Router } from "express"

const router = Router()
router.route("/send-notification").post(sendNotifications)
router.route("/get").get(verifyJWT, getNotifications)
router.route("/read/:notificationId").patch(verifyJWT, markNotificationAsRead)
router.route("/delete/:notificationId").delete(verifyJWT, deleteNotifications)

export default router