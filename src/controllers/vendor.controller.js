import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {Product} from "../models/product.model.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/Cloudinary.js"

const registerProduct = asyncHandler(async (req, res) => {
    const { name, description, category, brand, price, stock, ratings} = req.body;
    console.log(req.body);

    if (!name || !description || !category || !brand || !price || !stock || !ratings) {
        throw new ApiError(400, "All fields are required");
    }

    const images = req.files;
    console.log(images);

    if (!images || !images.images || images.images.length === 0) {
        throw new ApiError(400, "Product image is required");
    }

    const imageLocalPath = images.images[0].path;
    console.log("Local file path:", imageLocalPath);

    const image = await uploadOnCloudinary(imageLocalPath);
    console.log("Uploaded image:", image.url);

    if (!image || !image.url ) {
        throw new ApiError(400, "Error while uploading the image to Cloudinary");
    }

    const createdProduct = await Product.create({
        name,
        description,
        category,
        brand,
        price,
        stock,
        images: image.url,
        ratings,
    });

    if (!createdProduct) {
        throw new ApiError(400, "Product not created");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, createdProduct, "Product registered successfully"));
});

const deleteProduct = asyncHandler(async (req, res) => {
    try {
        const { productId } = req.params;

        // Find product
        const product = await Product.findById(productId);
        if (!product) {
            throw new ApiError(400, "Product not found")
        }

        // Delete image from Cloudinary (if exists)
        if (product.images && product.images.length > 0) {
            for (let imageUrl of product.images) {
                // Extract public_id from imageUrl
                const parts = imageUrl.split("/");
                const publicIdWithExtension = parts[parts.length - 1];
                const publicId = publicIdWithExtension.split(".")[0];

                await deleteFromCloudinary(publicId);
            }
        }

        // Delete product from DB
        await Product.findByIdAndDelete(productId);

        return res
        .status(201)
        .json(new ApiResponse(
            201,
            {},
            "Product deleted successfullly"
        ))
    } catch (error) {
        console.error("Error in deleteProduct:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete product",
            error: error.message,
        });
    }
});

const updateProduct = asyncHandler(async (req, res) => {
    try {
        const {description, stock, price, brand} = req.body
        const {productId} = req.params
    
        if (!productId) {
            throw new ApiError(400, "Product id is required")
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            {
                $set: {
                    description,
                    stock,
                    price,
                    brand
                }
            },
            {new: true}
        )
    
        return res
        .status(201)
        .json(new ApiResponse(
            201,
            updatedProduct,
            "Product updated successfully"
        ))
    } catch (error) {
        console.error("Failed to update product: ", error);
    }
})

const getProductById = asyncHandler(async (req, res) => {
    try {
        const {productId} = req.params
    
        if (!productId) {
            throw new ApiError(400, "Product id is required")
        }
    
        const product = await Product.findById(productId)
    
        if (!product) {
            throw new ApiError(400, "Product does not exist")
        }
    
        return res
        .status(201)
        .json(new ApiResponse(
            201,
            product,
            "Product get successfully"
        ))
    } catch (error) {
        console.error("Failed to get product by id: ", error);        
    }
})

const getAllProduct = asyncHandler(async (req, res) => {
    try {
        const products = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: "$ratings"},
                    totalStock: {$sum: "$stock"},
                    products: {$push: "$$ROOT"} 
                }
            }
        ])
    
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            products,
            "All products are successfully fetched"
        ))
    } catch (error) {
        console.error("Failed to get All product: ", error);
        
    }
})

const changeProductStatus = asyncHandler(async (req, res) => {
try {
        const {productId} = req.params
        const {status} = req.body //true or false
    
        if (!productId) {
            throw new ApiError(400, "Product id is required")
        }
    
        const product = await Product.findByIdAndUpdate(
            productId,
            {
                isActive: status
            },
            {new : true}
        )
    
        return res
        .status(201)
        .json(new ApiResponse(
            201,
            product,
            "Product status changed"
        ))
} catch (error) {
    console.error("Failed to change product status: ", error);
    
}
})

export {
    registerProduct,
    deleteProduct,
    updateProduct,
    getProductById,
    getAllProduct,
    changeProductStatus
}