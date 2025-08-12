import mongoose, { isValidObjectId } from 'mongoose'
import { Tweet } from '../models/tweet.models.js'
import { User } from '../models/user.models.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body

  if (!content || content.trim() === '') {
    throw new ApiError(400, 'Content is required')
  }

  if (content.length > 280) {
    throw new ApiError(400, 'Content cannot exceed 280 characters')
  }

  const owner = req.user?._id
  const tweet = await Tweet.create({ content: content.trim(), owner })
  const response = new ApiResponse(201, tweet, 'Tweet created successfully')
  return res.status(response.statusCode).json(response)
})

const getUserTweets = asyncHandler(async (req, res) => {
  const { username } = req.params
  if (!username) {
    throw new ApiError(400, 'Username is required')
  }
  const user = await User.findOne({ username })
  if (!user) {
    throw new ApiError(404, 'User not found')
  }
  const tweets = await Tweet.find({ owner: user._id })
    .sort({ createdAt: -1 })
    .populate('owner', 'fullName username avatar')

  const response = new ApiResponse(200, tweets, 'Tweets fetched successfully')
  return res.status(response.statusCode).json(response)
})

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params
  const { content } = req.body

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, 'Invalid tweet ID')
  }

  if (!content || content.trim() === '') {
    throw new ApiError(400, 'Content is required')
  }

  if (content.length > 280) {
    throw new ApiError(400, 'Content cannot exceed 280 characters')
  }

  const tweet = await Tweet.findOneAndUpdate(
    { _id: tweetId, owner: req.user?._id },
    { content: content.trim() },
    { new: true }
  )

  if (!tweet) {
    throw new ApiError(
      404,
      'Tweet not found or you are not authorized to update it'
    )
  }

  const response = new ApiResponse(200, tweet, 'Tweet updated successfully')
  return res.status(response.statusCode).json(response)
})

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, 'Invalid tweet ID')
  }

  const tweet = await Tweet.findOneAndDelete({
    _id: tweetId,
    owner: req.user?._id,
  })

  if (!tweet) {
    throw new ApiError(
      404,
      'Tweet not found or you are not authorized to delete it'
    )
  }

  const response = new ApiResponse(
    200,
    { deletedTweet: tweet },
    'Tweet deleted successfully'
  )
  return res.status(response.statusCode).json(response)
})

export {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
}
