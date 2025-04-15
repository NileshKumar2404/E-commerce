import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {User} from "../models/user.model.js"


const addAddress = asyncHandler(async(req, res) => {
    try {
        const {fullname, phoneNumber, pincode, state, city, houseNo, roadName} = req.body
    
        if (!fullname || !phoneNumber || !pincode || !state || !city || !houseNo || !roadName) {
            throw new ApiError(400, "All address fields are required")
        }

        const user = await User.findById(req.user._id)

        if(!user) throw new ApiError(400, "User not found");

        if(user.address.length >= 5) throw new ApiError(400, "Maximum 5 addresses are allowed")
    
        const newAddress = {
            fullName: fullname,
            phoneNumber,
            pinCode: pincode,
            state,
            city,
            houseNo,
            roadName
        }
    

        user.address.push(newAddress)
        await user.save()
    
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            user.address,
            "Address added successfully"
        ))
    } catch (error) {
        console.error("Failed to get error: ", error);
    }
})

const getAddress = asyncHandler(async(req, res) => {
    try {
        const userId = req.user._id
    
        const address = await User.findById(userId).select("address")
    
        if(!address) throw new ApiError(400, "Address not found");
    
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            address,
            "Address get successfully"
        ))
    } catch (error) {
        console.error("Failed to get address: ", error);
        
    }
})

const removeAddress = asyncHandler(async(req, res) => {
    try {
        const {addressId} = req.params
    
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $pull: {
                    address: {
                        _id: addressId
                    }
                }
            },
            {new: true}
        )
    
        return res
        .status(200)
        .json(new ApiResponse(
            200, 
            {},
            "Address deleted successfully"
        ))
    } catch (error) {
        console.error("Failed to delete address: ", error);
    }
})


export {getAddress,removeAddress, addAddress}