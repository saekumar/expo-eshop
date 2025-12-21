import express from 'express'
import path from 'path'
import { ENV } from './config/env.js'
import cors from 'cors'
import { connectDB } from './config/db.js'
import { clerkMiddleware } from '@clerk/express'

const app = express()
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://your-admin.vercel.app'],
    credentials: true,
  })
)
if (!ENV.CLERK_PUBLISHABLE_KEY || !ENV.CLERK_SECRET_KEY) {
  throw new Error('Clerk environment variables are not configured')
}
app.use(clerkMiddleware())

app.get('/api/check', (req, res) =>
  res.status(200).json({ message: 'success' })
)

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
