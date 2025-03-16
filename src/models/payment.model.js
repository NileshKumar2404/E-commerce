import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['PayPal', 'Stripe', 'COD'],
        required: true
    },
    transactionID: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Paid", "Failed", "Refunded"],
        default: "Pending"
    }    
}, {timestamps: true})

export const Payment = mongoose.model('Payment', paymentSchema)