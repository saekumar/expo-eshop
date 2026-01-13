import { Order } from '../models/order.model.js'
import { Product } from '../models/product.model.js'
import { Review } from '../models/review.model.js'
import mongoose from 'mongoose'

export async function createOrder(req, res) {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const user = req.user
    const { orderItems, shippingAddress, paymentResult, totalPrice } = req.body

    if (!orderItems || orderItems.length === 0) {
      await session.abortTransaction()
      await session.endSession()
      return res.status(400).json({ error: 'No order items' })
    }

    // validate products and stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product._id).session(session)
      if (!product) {
        await session.abortTransaction()
        await session.endSession()
        return res.status(404).json({ error: `Product ${item.name} not found` })
      }
      if (product.stock < item.quantity) {
        await session.abortTransaction()
        await session.endSession()
        return res
          .status(400)
          .json({ error: `Insufficient stock for ${product.name}` })
      }
    }

    // Create order within transaction
    const [order] = await Order.create(
      [
        {
          user: user._id,
          clerkId: user.clerkId,
          orderItems,
          shippingAddress,
          paymentResult,
          totalPrice,
        },
      ],
      { session }
    )

    // update product stock within transaction
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product._id,
        {
          $inc: { stock: -item.quantity },
        },
        { session }
      )
    }

    await session.commitTransaction()
    await session.endSession()

    res.status(201).json({ message: 'Order created successfully', order })
  } catch (error) {
    await session.abortTransaction()
    await session.endSession()
    console.error('Error in createOrder controller:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getUserOrders(req, res) {
  try {
    const orders = await Order.find({ clerkId: req.user.clerkId })
      .populate('orderItems.product')
      .sort({ createdAt: -1 })

    // check if each order has been reviewed

    const orderIds = orders.map((order) => order._id)
    const reviews = await Review.find({ orderId: { $in: orderIds } })
    const reviewedOrderIds = new Set(
      reviews.map((review) => review.orderId.toString())
    )

    const ordersWithReviewStatus = await Promise.all(
      orders.map(async (order) => {
        return {
          ...order.toObject(),
          hasReviewed: reviewedOrderIds.has(order._id.toString()),
        }
      })
    )

    res.status(200).json({ orders: ordersWithReviewStatus })
  } catch (error) {
    console.error('Error in getUserOrders controller:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
