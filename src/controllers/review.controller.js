import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Review } from "../models/review.model.js";
import { Product } from "../models/product.model.js"
import mongoose from "mongoose";


const addReview = asyncHandler(async (req, res) => {
    try {
        const {comment, ratings, productId} = req.body
        const userId = req.user._id
    
        const product = await Product.findById(productId)
        if(!product) throw new ApiError(400, "Product not found");
    
        const review = await Review.create({
            user: userId,
            product: productId,
            rating: ratings,
            comment: comment
        })
    
        if(!review) throw new ApiError(400, "Unable to add review");
    
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            review,
            "Review added successfully"
        ))
    } catch (error) {
        console.error("failed to add review: ", error);
    }
})

const updateReview = asyncHandler(async(req, res) => {
    try {
        const {reviewId} = req.params
        const {rating, comment} = req.body
    
        const updatedReview = await Review.findByIdAndUpdate(
            reviewId,
            {
                $set: {
                    rating: rating,
                    comment: comment
                }
            },
            {new: true}
        )
    
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            updatedReview,
            "Review updated successfully"
        ))
    } catch (error) {
        console.error("Failed to update review: ", error);
    }
})

const getReview = asyncHandler(async(req, res) => {
    try {
        const { productId } = req.params
        console.log(productId);
        
    
        const review = await Review.aggregate([
            {
                $match: { product: new mongoose.Types.ObjectId(productId) }
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
                $project: {
                    _id: 1,
                    rating: 1,
                    comment: 1,
                    "userDetails._id": 1,
                    "userDetails.name": 1
                }
            }
        ])
    
        if(!review) throw new ApiError(400, "Unable to get all reviews");
    
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            review,
            "All reviews get successfully"
        ))
    } catch (error) {
        console.error("Failed to get all review: ", error);
    }
})

const deleteReview = asyncHandler(async(req, res) => {
    const {reviewId} = req.params

    const deleteReviews = await Review.findByIdAndDelete(reviewId)
    if(!deleteReviews) throw new ApiError(400, "Review not found")

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {},
        "Review deleted successfully"
    ))
})

//For vendor
const getAllReviews = asyncHandler(async(req, res) => {
    const review = await Review.find().populate("user", "name").populate("product", "name")
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        review,
        "All reviews fetched successfully"
    ))
})

export {
    addReview,
    updateReview,
    getReview,
    deleteReview,
    getAllReviews
}