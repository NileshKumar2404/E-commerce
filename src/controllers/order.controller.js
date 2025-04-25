import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Order } from "../models/order.model.js";
import {Product} from "../models/product.model.js"
import crypto from 'crypto'
import { Cart } from "../models/cart.model.js";


const placeOrder = asyncHandler(async(req, res) => {
try {
        const userId = req.user._id
        const {productId, quantity, addressId} = req.body
        console.log(userId);
        
        const user = await User.findById(userId)
        if (!user || !user.address || user.address.length === 0) {
            throw new ApiError(400, "User address not found");
        }

        const selectedAddress = user.address.find(addr => addr._id.toString() === addressId)
        if(!selectedAddress) throw new ApiError(400, "Selected address not found")
    
        let products = []
        let totalAmount = 0

        if(productId && quantity){
            //Case 1: Buying a single product
            const product = await Product.findById(productId)
            if(!product) throw new ApiError(400, "Product not found");

            products.push({
                product: productId,
                quantity: quantity
            })

            totalAmount = product.price * quantity
        }else{
            //Case 2: Buying all the products in the cart
            const cart = await Cart.findOne({user: userId}).populate("products.product")
            if (!cart || cart.products.length === 0) throw new ApiError(400, "Cart not found");

            products = cart.products.map(item => ({
                product: item.product._id,
                quantity: item.quantity
            }))

            totalAmount = cart.products.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

            cart.products = []
            await cart.save()
        }
    
        // Generate a unique tracking ID
        const trackingId = `TRK-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
        
        let order = await Order.create({
            user: userId,
            products: products,
            totalAmount: totalAmount,
            address: selectedAddress,
            paymentStatus: true,
            orderStatus: "Pending",
            trackingID: trackingId
        })

        order = await order.populate("products.product")
    
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