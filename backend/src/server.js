import express from 'express'
import path from 'path'
import { ENV } from './config/env.js'
import cors from 'cors'

const app = express()
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://your-admin.vercel.app'],
    credentials: true,
  })
)

app.get('/api/check', (req, res) =>
  res.status(200).json({ message: 'success' })
)

app.listen(ENV.PORT, () => console.log('server is up and running'))
