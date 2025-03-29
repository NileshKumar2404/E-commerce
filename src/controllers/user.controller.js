import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {User} from "../models/user.model.js"
import jwt from "jsonwebtoken"

const generateAccessTokenandRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
    
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(400, "Something went wrong")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const {name, email, phone, address, password} = req.body

    if (!name || !email || !phone || !address || !password) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({email})
    if (existedUser) {
        throw new ApiError(400, "User already exists")
    }

    const user = await User.create(
        {
            name,
            email,
            phone,
            address,
            password,
        }
    )

    if (!user) {
        throw new ApiError(400, "User registration is failed")
    }

    const createdUser = await User.findById(user._id).select("-password")

    const {accessToken, refreshToken} = await generateAccessTokenandRefreshToken(user._id)

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(
        200,
        {User: createdUser, accessToken, refreshToken},
        "User registered successfully"
    ))
})

const loginUser = asyncHandler(async( req, res) => {
    const {email, password} = req.body

    if (!email || !password) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findOne({email})

    if (!user) {
        throw new ApiError(400, "User not exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)                            

    if (!isPasswordValid) {
        throw new ApiError(400, "Password is incorrect")
    }

    const {accessToken, refreshToken} = await generateAccessTokenandRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password, -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(
        200,
        {User: loggedInUser, accessToken, refreshToken},
        "User logged in successfully"
    ))
})

const logoutUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: ""
            }
        },
        {new: true}
    )

    if (!user) {
        throw new ApiError(400, "User not logged in")
    }

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(
        200,
        {},
        "User log out successfully"
    ))
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    //get oldpassword and newPassword from frontend
    //compare the password from the db
    const {oldPassword, newPassword} = req.body

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findById(req.user._id)
    const isPasswordValid = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordValid) {
        throw new ApiError(400, "Incorrect password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {},
        "Password changed successfully"
    ))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {address, phone, email} = req.body

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                address: address,
                phone: phone,
                email: email,
            }
        },
        {new: true}
    ).select("-password, -refreshToken")

    if (!user) {
        throw new ApiError(400, "User not exists")
    }

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        user,
        "Fields are successfully updated"
    ))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(400, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(400, "Refresh token expired")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(400, "Refresh token is expired or used")
        }

        const {accessToken, newRefreshToken } = await generateAccessTokenandRefreshToken(user._id)

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(
            200,
            {
                accessToken,
                refreshToken: newRefreshToken
            },
            "Access token refreshed"
        ))
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.aggregate([
        {
            $match: {}
        },
        {
            $project: {
                _id: 1,
                name: 1,
                email: 1,
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        users,
        "Successfully fetched all users"
    ))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    changeCurrentPassword,
    updateAccountDetails,
    refreshAccessToken,
    getAllUsers
}