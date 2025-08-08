import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import ApiError from './ApiError.js'

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const safeDeleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log('Local file deleted:', filePath)
    }
  } catch (error) {
    console.error('Error deleting local file:', filePath, error.message)
  }
}

export const uploadToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      throw new ApiError(400, 'Local file path is required')
    }

    if (!fs.existsSync(localFilePath)) {
      throw new ApiError(400, 'File does not exist at path: ' + localFilePath)
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    })
    console.log('file uploaded to cloudinary. SRC: ', response.secure_url)

    safeDeleteFile(localFilePath)
    return response
  } catch (error) {
    safeDeleteFile(localFilePath)

    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(500, 'Error uploading to cloudinary: ' + error.message)
  }
}

export const deleteFromCloudinary = async (publicId) => {
  try {
    const response = await cloudinary.uploader.destroy(publicId)
    console.log('file deleted from cloudinary. PUBLIC ID: ', publicId)
    return response
  } catch (error) {
    throw new ApiError(
      500,
      'Error deleting file from cloudinary. PUBLIC ID: ' +
        publicId +
        ' ' +
        error.message
    )
  }
}
