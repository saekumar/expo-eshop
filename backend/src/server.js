import express from 'express'
import path from 'path'
import { ENV } from './config/env.js'
import cors from 'cors'
import { connectDB } from './config/db.js'
import { clerkMiddleware } from '@clerk/express'
import { serve } from 'inngest/express'
import { functions, inngest } from './config/inngest.js'
import adminRoutes from './routes/admin.route.js'
import userRoutes from './routes/user.route.js'
import orderRoutes from './routes/order.route.js'
import reviewRoutes from './routes/review.route.js'
import productRoutes from './routes/product.route.js'
import cartRoutes from './routes/cart.route.js'
import axios from 'axios'
const app = express()
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://expo-eshop.vercel.app'],
    credentials: true,
  })
)
if (!ENV.CLERK_PUBLISHABLE_KEY || !ENV.CLERK_SECRET_KEY) {
  throw new Error('Clerk environment variables are not configured')
}
app.use(clerkMiddleware())
app.use(express.json())

app.use('/api/inngest', serve({ client: inngest, functions }))

app.use('/api/admin', adminRoutes)
app.use('/api/users', userRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)

const startServer = async () => {
  try {
    await connectDB()
    app.listen(ENV.PORT, () => {
      console.log(`Server is running on port ${ENV.PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}
startServer()

// app.post('/send-otp', async (req, res) => {
//   try {
//     const { phone } = req.body
//     if (!phone) return res.status(400).json({ message: 'Phone is required' })
//     console.log(phone)
//     console.log(process.env.MSG_91_AUTH_KEY)

//     const response = await axios.post(
//       'https://control.msg91.com/api/v5/otp',
//       {
//         mobile: phone,
//         otp_length: 6,
//         otp_expiry: 5,
//       },
//       {
//         headers: {
//           authkey: process.env.MSG_91_AUTH_KEY,
//           'Content-Type': 'application/json',
//         },
//       }
//     )
//     console.log(response)

//     res.json({
//       message: 'OTP sent successfully',
//       data: response.data,
//     })
//   } catch (err) {
//     res.status(500).json({
//       message: 'Failed to send OTP',
//       error: err.response?.data || err.message,
//     })
//   }
// })

// /**
//  * VERIFY OTP
//  * body: { phone: "91XXXXXXXXXX", otp: "123456" }
//  */
// app.post('/verify-otp', async (req, res) => {
//   try {
//     const { phone, otp } = req.body
//     if (!phone || !otp)
//       return res.status(400).json({ message: 'Phone and OTP required' })

//     const response = await axios.post(
//       'https://control.msg91.com/api/v5/otp/verify',
//       {
//         mobile: phone,
//         otp,
//       },
//       {
//         headers: {
//           authkey: process.env.MSG91_AUTH_KEY,
//           'Content-Type': 'application/json',
//         },
//       }
//     )

//     res.json({
//       message: 'OTP verified successfully',
//       data: response.data,
//     })
//   } catch (err) {
//     res.status(400).json({
//       message: 'Invalid or expired OTP',
//       error: err.response?.data || err.message,
//     })
//   }
// })
