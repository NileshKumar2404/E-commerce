import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Payment } from "../models/payment.model.js";
import { Order } from "../models/order.model.js";
import crypto from 'crypto'
import mongoose from "mongoose";

const addPayment = asyncHandler(async(req, res) => {
    try {
        const userId = req.user._id
        const {orderId, paymentMethod, status} = req.body

        const orderFetch = await Order.findById(orderId)
        if(!orderFetch) throw new ApiError(400, "Order not found");

         // Ensure the order belongs to the authenticated user
        if (orderFetch.user.toString() !== userId.toString()) {
            throw new ApiError(403, "You are not authorized to make a payment for this order");
        }

        const transactionId = `TRK-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;

        const payment = await Payment.create({
            user: userId,
            order: orderFetch._id,
            amount: orderFetch.totalAmount,
            paymentMethod,
            transactionID: transactionId,
            status
        })

        if(!payment) throw new ApiError(400, "Unable to create payment");

        if (status === "Paid") {
            await Order.findByIdAndUpdate(orderId, {paymentStatus: true})
        }

        return res
        .status(200)
        .json(new ApiResponse(
            200,
            payment,
            "Payment added successfully"
        ))

    } catch (error) {
        console.error("Failed to initiate payment: ", error);
    }
})

const getPayments = asyncHandler(async(req, res) => {
    try {
        const {paymentId} = req.params
    
        const payment = await Payment.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(paymentId)
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $lookup: {
                    from: 'orders',
                    localField: 'order',
                    foreignField: '_id',
                    as: 'orderDetails'
                }
            },
            {
                $project: {
                    _id: 1,
                    amount: 1,
                    paymentMethod: 1,
                    transactionID: 1,
                    status: 1,
                    "orderDetails._id": 1,
                    "orderDetails.totalAmount": 1,
                    "userDetails._id": 1,
                    "userDetails.name": 1
                }
            }
        ])
    
        if(!payment) throw new ApiError(400, "Unable to get payment details");
    
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            payment,
            "Payment get successfully"
        ))
    } catch (error) {
        console.error("Failed to get payments: ", error);
    }
})

const updatePaymentStatus = asyncHandler(async(req, res) => {
    try {
        const {paymentId} = req.params
        const {status} = req.body
    
        const validStatuses = ["Pending", "Paid", "Failed", "Refunded"]
        if(!validStatuses.includes(status)) throw new ApiError(400, "Invalid status update");
    
        const payment = await Payment.findById(paymentId)
        if(!payment) throw new ApiError(400, "Unable to find payment");
    
        payment.status = status
        await payment.save()
    
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            payment,
            "Payment status updated"
        ))
    } catch (error) {
        console.error("Failed to update status: ", error);
    }
})

export {
    addPayment,
    getPayments,
    updatePaymentStatus
}