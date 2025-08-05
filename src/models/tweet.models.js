import mongoose, { Schema } from 'mongoose'

const tweetSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 280, // Twitter-like character limit
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

// Index for efficient queries by owner and creation time
tweetSchema.index({ owner: 1, createdAt: -1 })

export const Tweet = mongoose.model('Tweet', tweetSchema)
