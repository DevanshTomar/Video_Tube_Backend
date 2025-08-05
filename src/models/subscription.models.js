import mongoose, { Schema } from 'mongoose'

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    channel: {
      type: Schema.Types.ObjectId, 
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

// Ensure a user can't subscribe to the same channel twice
subscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true })

// Index for efficiently finding subscribers of a channel
subscriptionSchema.index({ channel: 1 })

// Index for efficiently finding channels a user subscribes to
subscriptionSchema.index({ subscriber: 1 })

export const Subscription = mongoose.model('Subscription', subscriptionSchema)
