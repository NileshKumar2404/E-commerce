import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"

// Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_API_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });

    const uploadOnCloudinary = async(localFilePath) => {
        try {
            if(!localFilePath) {
                console.error("Local file path is missing.")
                return null
            }

            const response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto",
                source: true
            })

            //file has uploaded successfully
            fs.unlinkSync(localFilePath)
            return response
        } catch (error) {
            console.error("Error uploading to Cloudinary:", error);
            
            fs.unlinkSync(localFilePath)
            return null
        }
    }
export {uploadOnCloudinary}

export const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        return null;
    }
};