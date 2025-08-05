import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

// cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// upload to cloudinary
export const uploadToCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        })
        console.log("file uploaded to cloudinary. SRC: ", response.url)
        
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        // delete the local file
        fs.unlinkSync(localFilePath)
        // return null
        return null
    }
}