import mongoose, { Schema } from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
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

// Index for efficiently finding comments for a video
commentSchema.index({ video: 1, createdAt: -1 })

// Index for efficiently finding comments by owner
commentSchema.index({ owner: 1 })

// Plugin for aggregation pagination
commentSchema.plugin(mongooseAggregatePaginate)

export const Comment = mongoose.model('Comment', commentSchema)
