import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Wishlist } from "../models/wishlist.model.js";
import { Product } from "../models/product.model.js";


const addToWishlist = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id
        const {productId} = req.body
    
        const product = await Product.findById(productId)
        if(!product) throw new ApiError(400, "Product does not exist");

        let wishlist = await Wishlist.findOne({user: userId})

        if (wishlist) {
            if (wishlist.products.includes(productId)) {
                throw new ApiError(400, "Product already in wishlist")
            }
            wishlist.products.push(productId)
        }else{
            wishlist = new Wishlist({user: userId, products: [productId]})
        }

        await wishlist.save()

        return res
        .status(200)
        .json(new ApiResponse(
            201,
            wishlist,
            "Product added in the wishlist"
        ))
    } catch (error) {
        console.error("Failed to add product in wishlist: ", error);
    }
})

const removeFromWishlist = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id
        const {productId} = req.body

        const wishlist = await Wishlist.findOne({user: userId})
        if (!wishlist) {
            throw new ApiError(400, "Wishlist not found")
        }

        await Wishlist.updateOne(
            {user: userId},
            {$pull: 
                {products: productId}
            }
        )

        return res
        .status(201)
        .json(new ApiResponse(201,{},'Product remove successfully'))
    } catch (error) {
        console.error("Failed to remove product from wishlist: ", error);
    }
})

const getUserWishlist = asyncHandler(async (req, res) => {
    const userId = req.user._id
    console.log(userId);

    const wishlist = await Wishlist.aggregate([
        {
            $match: {
                user: userId
            }
        },
        {
            $lookup: {
                from: 'products',
                localField: 'products',
                foreignField: '_id',
                as: 'wishlistItems'
            }
        },
        {
            $project: {
                _id: 0,
                "wishlistItems._id": 1,
                "wishlistItems.name": 1,
                "wishlistItems.brand": 1,
                "wishlistItems.price": 1,
                "wishlistItems.stock": 1,
                "wishlistItems.images": 1,
                "wishlistItems.ratings": 1,
            }
        }
    ])

    if(!wishlist.length) throw new ApiError(400, "Wishlist not found");

    return res
    .status(201)
    .json(new ApiResponse(
        201,
        wishlist,
        "User wishlist fetched"
    ))
})

const clearWishlist = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id

        const wishlist = await Wishlist.findOneAndUpdate(
            {user: userId},
            {
                $set: {
                    products: []
                }
            },
            {new: true}
        )

        if(!wishlist) throw new ApiError(400, "Wishlist not found")

        return res
        .status(201)
        .json(new ApiResponse(
            201,
            {},
            "Wishlist clear successfully"
        ))
    } catch (error) {
        console.error("Failed to clear wishlist: ", error);
    }
})

export {
    addToWishlist,
    removeFromWishlist,
    getUserWishlist,
    clearWishlist
}