import asyncHandler from '../utils/asyncHandler.js'
import ApiResponse from '../utils/ApiResponse.js'
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from '../utils/cloudinary.js'
import ApiError from '../utils/ApiError.js'
import { User } from '../models/user.models.js'
import jwt from 'jsonwebtoken'

//helper function to generate access and refresh token
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId)
    if (!user){
      throw new ApiError(404, 'User not found')
    }
    //generate access and refresh token
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    
    user.refreshToken = refreshToken
    await user.save({
      validateBeforeSave: false,
    })

    return {
      accessToken,
      refreshToken,
    }
  } catch (error) {
    throw new ApiError(500, 'Error generating access and refresh token')
  }
}

const registerUser = asyncHandler(async (req, res) => {
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


const loginUser = asyncHandler(async (req, res) => {
  const {email, username, password} = req.body

  if ([email, username, password].some((field) => field?.trim() === '')) {
    throw new ApiError(400, 'All fields are required')
  }

  //check if user exists
  const user = await User.findOne({$or: [{email}, {username}]})

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  //check if password is correct
  const isPasswordCorrect = await user.isPasswordCorrect(password)
  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Invalid password')
  }

  //generate access and refresh token
  const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

  //for extra security
  const loggedInUser = await User.findById(user._id).select('-password -refreshToken')

  if (!loggedInUser) {
    throw new ApiError(500, 'Something went wrong while logging in')
  }

  //set cookies
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: process.env.REFRESH_TOKEN_EXPIRY,
  }

  const response = new ApiResponse(200, {user: loggedInUser, accessToken, refreshToken}, 'User logged in successfully')
  res.cookie('accessToken', accessToken, options)
  res.cookie('refreshToken', refreshToken, options)
  res.status(response.statusCode).json(response)
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const {incomingRefreshToken} = req.cookies || req.headers.cookie || req.body

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Refresh token is required')
  }

  try {
    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    if (!decoded) {
      throw new ApiError(401, 'Invalid refresh token, token is not valid')
    }

    const userId = decoded?._id

    const user = await User.findById(userId)

    if (!user) {
      throw new ApiError(404, 'User not found, invalid refresh token')
    }

    //check if refresh token is valid
    if (user?.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, 'Invalid refresh token, refresh token mismatch')
    }

    //generate new access token
    const {accessToken: newAccessToken, refreshToken: newRefreshToken} = await generateAccessAndRefreshToken(userId)

    const response = new ApiResponse(200, {accessToken: newAccessToken, refreshToken: newRefreshToken}, 'Access token refreshed successfully')

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: process.env.REFRESH_TOKEN_EXPIRY,
    }

    res.cookie('accessToken', newAccessToken, options)
    res.cookie('refreshToken', newRefreshToken, options)
    res.status(response.statusCode).json(response)
  } catch (error) {
    throw new ApiError(401, 'Invalid refresh token: ' + error.message)
  }
})

export { registerUser, loginUser, refreshAccessToken }
