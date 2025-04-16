import mongoose, { Schema } from "mongoose";

const addressSchema = new Schema({
    fullName: String,
    phoneNumber: String,
    pinCode: String,
    state: String,
    city: String,
    houseNo: String,
    roadName: String
}, {_id:true})

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
    
    address: addressSchema,

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