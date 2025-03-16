import mongoose, { Schema } from "mongoose";

const productSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        default: 0,
        required: true
    },
    images: [
        {
            type: String,
            required: true
        }
    ],
    ratings: {
        type: Number,
        default: 0,
        required: true
    },
    reviews: {
        type: Schema.Types.ObjectId,
        ref: 'Review',
        required: true 
    }
}, {timestamps: true})

export const Product = mongoose.model('Product', productSchema)