import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const addressSchema = new Schema({
    fullName: String,
    phoneNumber: String,
    pinCode: String,
    state: String,
    city: String,
    houseNo: String,
    roadName: String
}, {_id:true})

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    }, 
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        required: true,
        unique: true
    },
    address: [addressSchema],
    
    password: {
        type: String,
        required: true
    },
    wishlist: [{
        type: Schema.Types.ObjectId,
        ref: 'Product',
    }],
    isVendor: {
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String
    }
},{timestamps: true})

userSchema.pre('save', async function(next) {
    if(!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = async function() {
    return jwt.sign(
        {
            _id: this._id,
            name: this.name,
            email: this.email,
            phone: this.phone,
            address: this.address,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = async function() {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model('User', userSchema) 