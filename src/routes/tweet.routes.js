import { Router } from 'express'
import {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
} from '../controllers/tweet.controllers.js'
import { verifyAccessToken } from '../middlewares/verifyAccessToken.js'

const router = Router()

router.route('/create-tweet').post(verifyAccessToken, createTweet)
router.route('/get-user-tweets/:username').get(verifyAccessToken, getUserTweets)
router.route('/update-tweet/:tweetId').patch(verifyAccessToken, updateTweet)
router.route('/delete-tweet/:tweetId').delete(verifyAccessToken, deleteTweet)

export default router