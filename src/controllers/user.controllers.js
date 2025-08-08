import asyncHandler from '../utils/asyncHandler.js'
import ApiResponse from '../utils/ApiResponse.js'
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from '../utils/cloudinary.js'
import ApiError from '../utils/ApiError.js'
import { User } from '../models/user.models.js'

const registerUser = asyncHandler(async (req, res, next) => {
  // if request body is empty
  if (Object.keys(req.body).length === 0) {
    throw new ApiError(400, 'Request body is empty')
  }

  const { fullName, username, email, password } = req.body

  //validation
  if (
    [fullName, email, username, password].some((field) => field?.trim() === '')
  ) {
    throw new ApiError(400, 'All fields are required')
  }

  //check if user already exists
  const existingUser = await User.findOne({ $or: [{ email }, { username }] })
  if (existingUser) {
    throw new ApiError(409, 'User already exists')
  }

  //upload files
  const avatarLocalPath = req.files?.avatar?.[0]?.path
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path

  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar is required')
  }

  // Upload avatar (required)
  const avatarResponse = await uploadToCloudinary(avatarLocalPath)
  const avatarUrl = avatarResponse.secure_url

  let coverImageUrl = null
  if (coverImageLocalPath) {
    try {
      const coverImageResponse = await uploadToCloudinary(coverImageLocalPath)
      coverImageUrl = coverImageResponse.secure_url
    } catch (error) {
      console.log('Error uploading cover image:', error.message)
      // Cover image is optional, so we continue without it
    }
  }

  try {
    const user = await User.create({
      fullName,
      email,
      username,
      password,
      avatar: avatarUrl,
      coverImage: coverImageUrl,
    })

    const createdUser = await User.findById(user._id).select(
      '-password -refreshToken'
    )

    if (!createdUser) {
      throw new ApiError(500, 'Something went wrong while creating user')
    }

    const response = new ApiResponse(
      201,
      createdUser,
      'User created successfully'
    )
    res.status(response.statusCode).json(response)
  } catch (error) {
    if (avatarUrl && avatarUrl.includes('cloudinary')) {
      await deleteFromCloudinary(avatarUrl.split('/').pop().split('.')[0])
    }
    if (coverImageUrl && coverImageUrl.includes('cloudinary')) {
      await deleteFromCloudinary(coverImageUrl.split('/').pop().split('.')[0])
    }
    throw new ApiError(
      500,
      'Error creating user and images were deleted: ' + error.message
    )
  }
})

export { registerUser }
