import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js'
import User from './models/User.js'
import authRoutes from './routes/auth.js'
import donorRoutes from './routes/donors.js'
import requestRoutes from './routes/requests.js'
import donationRoutes from './routes/donations.js'
import adminRoutes from './routes/admin.js'
import organPledgeRoutes from './routes/organPledges.js'
import aiRoutes from './routes/ai.js'
import { notFound, errorHandler } from './middleware/error.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from server/.env, root .env, or process env
dotenv.config({ path: path.join(__dirname, '.env') })
dotenv.config({ path: path.join(__dirname, '../.env') })
dotenv.config()

const app = express()

// Normalize client origins (strip trailing slashes & support comma-separated list)
const clientUrls = (process.env.CLIENT_URL || '')
  .split(',')
  .map((u) => u.trim().replace(/\/+$/, ''))
  .filter(Boolean)

const allowedOrigins = [
  ...clientUrls,
  'http://localhost:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5000',
]

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like curl, mobile apps, Postman, or health checks)
      if (!origin) return callback(null, true)
      const cleanOrigin = origin.replace(/\/+$/, '')
      if (allowedOrigins.includes(cleanOrigin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true)
      }
      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  })
)

app.use(express.json())

// Health check endpoint
app.get('/api/health', (_req, res) => res.json({ ok: true, status: 'healthy', timestamp: new Date() }))

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/donors', donorRoutes)
app.use('/api/requests', requestRoutes)
app.use('/api/donations', donationRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/organ-pledges', organPledgeRoutes)
app.use('/api/ai', aiRoutes)

// Serve frontend static assets if running unified production monolith
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../client/dist')
  app.use(express.static(distPath))
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next()
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.use(notFound)
app.use(errorHandler)

async function ensureAdminUser() {
  try {
    const email = (process.env.ADMIN_EMAIL || 'admin@blooddonor.local').trim().toLowerCase()
    const password = process.env.ADMIN_PASSWORD || 'Admin@12345'
    const admin = await User.findOne({ email }).select('+password')
    if (!admin) {
      await User.create({ name: 'Administrator', email, password, role: 'admin' })
      console.log(`[Auto-Seed] Admin account created in MongoDB Atlas: ${email}`)
    } else {
      let needsSave = false
      if (admin.role !== 'admin') {
        admin.role = 'admin'
        needsSave = true
      }
      if (admin.isBlocked) {
        admin.isBlocked = false
        needsSave = true
      }
      const matches = await admin.matchPassword(password)
      if (!matches) {
        admin.password = password
        needsSave = true
      }
      if (needsSave) {
        await admin.save()
        console.log(`[Auto-Seed] Admin password and role synced in MongoDB Atlas: ${email}`)
      } else {
        console.log(`[Admin Ready] Admin account ready: ${email}`)
      }
    }
  } catch (err) {
    console.error('[Auto-Seed] Failed to initialize admin account:', err.message)
  }
}

const PORT = process.env.PORT || 5000

connectDB()
  .then(async () => {
    await ensureAdminUser()
    app.listen(PORT, () => {
      console.log(`API running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message)
    process.exit(1)
  })

