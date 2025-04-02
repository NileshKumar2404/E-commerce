import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import { Notification } from "../models/notification.model.js"


const sendNotifications = asyncHandler(async(req, res) => {
    try {
        const {userId, message, type} = req.body
    
        if (!userId || !message || !type) {
            throw new ApiError(400, "All fields are required")
        }
    
        const notification = await Notification.create({
            user: userId,
            message: message,
            type: type
        })
    
        if(!notification) throw new ApiError(400, "Unable to create notifications");
    
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            notification,
            "Notification created successfully"
        ))
    } catch (error) {
        console.error("Failed to create notifications: ", error);
    }
})

const getNotifications = asyncHandler(async(req, res) => {
    try {
        const userId = req.user._id
    
        const notifications = await Notification.find({user: userId}).sort({createdAt: -1})
        if(!notifications) throw new ApiError(400, "Unable to get notifications");
    
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            notifications,
            "Notifications fetched successfully"
        ))
    } catch (error) {
        console.error("Failed to get notifications: ", error);
    }
})

const markNotificationAsRead = asyncHandler(async(req, res) => {
    try {
        const {notificationId} = req.params
    
        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            {
                isRead: true,
            },
            {new: true}
        )
        if(!notification) throw new ApiError(400, "Unable to update notifications");
    
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            notification,
            "Notification updated successfully"
        ))
    } catch (error) {
        console.error("Failed to mark notification: ", error);
    }
})

const deleteNotifications = asyncHandler(async(req, res) => {
    try {
        const {notificationId} = req.params
    
        const notification = await Notification.findByIdAndDelete(notificationId)
        if(!notification) throw new ApiError(400, "Unable to delete notifications");
    
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            "Notification deleted successfully"
        ))
    } catch (error) {
        console.error("Failed to delete notifications: ", error);
    }
})

export {
    sendNotifications,
    getNotifications,
    markNotificationAsRead,
    deleteNotifications
}