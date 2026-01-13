import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
  },
  { timestamps: true }
)
// Prevent duplicate reviews: one review per user per product per order
reviewSchema.index({ productId: 1, userId: 1, orderId: 1 }, { unique: true })

// Index for fetching reviews by product
reviewSchema.index({ productId: 1, createdAt: -1 })

export const Review = mongoose.model('Review', reviewSchema)
