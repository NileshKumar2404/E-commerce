import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Order } from "../models/order.model.js";
import crypto from 'crypto'
import { Cart } from "../models/cart.model.js";


const placeOrder = asyncHandler(async(req, res) => {
try {
        const userId = req.user._id
        console.log(userId);
        
        const user = await User.findById(userId)
        if (!user || !user.address || user.address.length === 0) {
            throw new ApiError(400, "User address not found");
        }
    
        const cart = await Cart.findOne({user: userId}).populate("products.product")
        if(!cart || cart.products.length == 0) throw new ApiError(400 , "Cart not found");
    
        let totalAmount = 0
        cart.products.forEach(item => {
            totalAmount += item.product.price * item.quantity
        })
    
        // Generate a unique tracking ID
        const trackingId = `TRK-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
        
        const order = await Order.create({
            user: userId,
            products: cart.products,
            totalAmount: totalAmount,
            address: user.address[0],
            paymentStatus: true,
            orderStatus: "Pending",
            trackingID: trackingId
        })
    
        await Cart.findOneAndUpdate(
            {
                user: userId
            },
            {
                $set: {
                products: []
                }
            }
        )
    
        return res
        .status(201)
        .json(new ApiResponse(
            201,
            order,
            "Order placed successfully"
        ))
} catch (error) {
    console.error("Failed to place order: ", error);
}
})

const getUserOrders = asyncHandler(async(req, res) => {
    try {
        const userId = req.user._id
    
        const orders = await Order.aggregate([
            {
                $match: {
                    user: userId
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'products.product',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {
                $project: {
                    user: 0,
                    productDetails: 0
                }
            }
        ])
        
        return res
        .status(200)
        .json(new ApiResponse(
            200, 
            orders,
            "Orders get successfully"
        ))
    } catch (error) {
        console.error("Failed to get user orders: ", error);
    }
})

//for admin
const getAllOrders = asyncHandler(async(req, res) => {
    const orders = await Order.find().populate("user","name email").populate("products.product", "name price")
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        orders,
        "All orders are fetched successfully"
    ))
})

//For admin
const updateOrderStatus = asyncHandler(async(req, res) => {
    try {
        const {orderId} = req.params
        const {status} = req.body
    
        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                $set: {
                orderStatus: status
                }
            },
            {new: true}
        )
    
        if(!order) throw new ApiError(400, "Order not found");
    
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            order,
            "Order status updated successfully"
        ))
    } catch (error) {
        console.error("Failed to update order status: ", error);
    }
})

const cancelOrder = asyncHandler(async(req, res) => {
    try {
        const {orderId} = req.params
    
        const order = await Order.findById(orderId)
        if(!order) throw new ApiError(400, "Order not found");
    
        if(order.orderStatus === "Delivered") throw new ApiError(400, "Delieverd order should not be cancelled");
    
        order.orderStatus = "Cancelled"
        await order.save()
    
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            order,
            "Order cancelled successfully"
        ))
    } catch (error) {
        console.error("Failed to cancel order: ", error);
    }
})

export {
    placeOrder,
    getUserOrders,
    updateOrderStatus,
    cancelOrder,
    getAllOrders
}