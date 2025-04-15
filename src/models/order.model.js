import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [
        {
            product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true, default: 1 }
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String},
        country: { type: String, required: true },
    },
    paymentStatus: {
        type: Boolean,
        default: false,
        required: true
    },
    orderStatus: {
        type: String,
        default: "Pending",
        enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
    },
    trackingID: {
        type: String,
        required: true
    }
}, {timestamps: true})

export const Order = mongoose.model('Order', orderSchema)