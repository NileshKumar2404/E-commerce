import {asyncHandler} from "../utils/asyncHandler.js"
import {Product} from "../models/product.model.js"
import {Cart} from "../models/cart.model.js"
import {ApiError} from "../utils/ApiError.js"
import mongoose from "mongoose"
import {ApiResponse} from "../utils/ApiResponse.js"

const addToCart = asyncHandler(async(req, res) => {
    try {
        const userId = req.user._id
        const {productId, quantity} = req.body
    
        const product = await Product.findById(productId)

        if(!product) throw new ApiError(400, "Product not exist");

        let cart = await Cart.findOne({user: userId})
        console.log("Fetch from cart model: ",cart);
        

        if (cart) {
            const existingProduct = cart.products.find(p => p.product.toString() === productId)
            if (existingProduct) {
                existingProduct.quantity += quantity
            }else{
                cart.products.push({
                    product: productId,
                    quantity
                })
            }
        }else{
            cart = new Cart({
                user: userId,
                products: [{
                    product: productId,
                    quantity
                }],
                totalPrice: 0
            })
        }

        cart.totalPrice = 0
        for(let item of cart.products) {
            const prod = await Product.findById(item.product)
            cart.totalPrice += prod.price * item.quantity
        }
        console.log(cart.totalPrice);
        

        await cart.save()

        return res
        .status(201)
        .json(new ApiResponse(
            201,
            cart,
            "Product added to cart"
        ))
    } catch (error) {
        console.error("Failed to add item in a cart: ", error);
        
    }
})

const removeProduct = asyncHandler(async (req, res) => {
    //take user id and product id from frontend
    //using user id find the cart is existed or not
    //remove product from the cart, if no of prodcuts greater than 1 then remove 1 product and update the total price

    try {
        const userId = req.user._id
        const {productId} = req.params
    
        if (!productId) {
            throw new ApiError(400, "Product not found || Product not existed")
        }
    
        let cart = await Cart.findOne({user: userId})
        if(!cart) throw new ApiError(400, "Cart not existed");
    
        cart.products = cart.products.filter(p => p.product.toString() !== productId)
    
        cart.totalPrice = 0
        for(let item of cart.products){
            const prod = await Product.findById(item.product)
            cart.totalPrice += prod.price * item.quantity
        }
    
        await cart.save()
    
        return res
        .status(201)
        .json(new ApiResponse(
            201,
            cart,
            "Product remove from cart successfully"
        ))
    } catch (error) {
        console.error("Failed to remove product: ", error);
        
    }
})

const updateQuantity = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id; // Extract user ID from the authenticated user
        const { productId, quantity } = req.body; // Extract product ID from the request parameters
    
        if (!productId) {
            throw new ApiError(400, "Product not found || Product not existed");
        }

        if (quantity <= 0) {
            throw new ApiError(400, "Quantity must be greater than 0");
        }
    
        // Find the cart for the user
        let cart = await Cart.findOne({ user: userId });
        if (!cart) throw new ApiError(400, "Cart not existed");

        // Convert productId to ObjectId for comparison
        const objectIdProductId = new mongoose.Types.ObjectId(productId);
    
        // Find the product in the cart
        const productInCart = cart.products.find(p => p.product.toString() === objectIdProductId.toString());
        if (!productInCart) throw new ApiError(404, "Product not in cart");
    
    
        productInCart.quantity = quantity
    
        // Recalculate the total price
        cart.totalPrice = 0;
        for (let item of cart.products) {
            const prod = await Product.findById(item.product);
            cart.totalPrice += prod.price * item.quantity;
        }
    
        // Save the updated cart
        await cart.save();
    
        return res
            .status(201)
            .json(new ApiResponse(
                201,
                cart,
                "Product quantity updated successfully"
            ));
    } catch (error) {
        console.error("Failed to update quantity: ", error);
        
    }
});

const getCart = asyncHandler(async (req, res) => {
try {
    const userId = req.user._id

    const cart = await Cart.aggregate([
        {
            $match: {
                user: userId
            }
        },
        {
            $unwind: "$products"
        },
        {
            $lookup: {
                from: "products",
                localField: "products.product",
                foreignField: "_id",
                as: "productDetails"
            }
        },
        {
            $unwind: "$productDetails"
        },
        {
            $project: {
                _id: 1,
                user: 1,
                quantity: "$products.quantity",
                productId: "$products.product",
                totalPrice: 1,
                "productDetails.name": 1,
                "productDetails.price": 1,
                "productDetails.images": 1,
            }
        }
    ])
    if(!cart) throw new ApiError(400, "Cart not found");

    return res
    .status(201)
    .json(new ApiResponse(
        201,
        cart,
        "Cart get successfully"
    ))
} catch (error) {
    console.error("Failed to get cart: ", error);
}
})

const clearCart = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id

        const cart = await Cart.findOneAndDelete({user: userId})
        console.log(cart);
        
        return res
        .status(201)
        .json(new ApiResponse(
            201,
            {},
            "Cart clear successfully"
        ))

    } catch (error) {
        console.error("Failed to clear cart: ", error);
    }
})

export {
    addToCart,
    removeProduct,
    updateQuantity,
    getCart,
    clearCart
}