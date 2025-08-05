import mongoose, { Schema } from 'mongoose'

const likeSchema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: 'Tweet',
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Ensure a user can only like a specific content once
likeSchema.index({ video: 1, likedBy: 1 }, { unique: true, sparse: true })
likeSchema.index({ comment: 1, likedBy: 1 }, { unique: true, sparse: true })
likeSchema.index({ tweet: 1, likedBy: 1 }, { unique: true, sparse: true })

// Index for efficiently finding likes by user
likeSchema.index({ likedBy: 1 })

// Index for efficiently finding likes for specific content
likeSchema.index({ video: 1 })
likeSchema.index({ comment: 1 })
likeSchema.index({ tweet: 1 })

export const Like = mongoose.model('Like', likeSchema)
