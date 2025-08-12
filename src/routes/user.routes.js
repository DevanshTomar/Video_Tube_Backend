import { Router } from 'express'
import { registerUser, loginUser, refreshAccessToken, logoutUser, changeCurrentPassword, getCurrentUser, userChannelProfile, getWatchHistory, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from '../controllers/user.controllers.js'
import { verifyAccessToken } from '../middlewares/auth.middlewares.js'
import { upload } from '../middlewares/multer.middlewares.js'

const router = Router()

//public routes

router.route('/register').post(
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
  ]),
  registerUser
)

router.route('/login').post(loginUser)

router.route('/refresh-access-token').post(refreshAccessToken)


//authenticated routes

router.route('/change-password').post(verifyAccessToken, changeCurrentPassword)

router.route('/current-user').get(verifyAccessToken, getCurrentUser)

router.route('/channel-profile/:username').get(verifyAccessToken, userChannelProfile)

router.route('/watch-history').get(verifyAccessToken, getWatchHistory)

router.route('/update-account-details').put(verifyAccessToken, updateAccountDetails)

router.route('/update-avatar').patch(verifyAccessToken, upload.single('avatar'), updateUserAvatar)

router.route('/update-cover-image').patch(verifyAccessToken, upload.single('coverImage'), updateUserCoverImage)

router.route('/logout').post(verifyAccessToken, logoutUser)



export default router
