import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js'
import authRoutes from './routes/auth.js'
import donorRoutes from './routes/donors.js'
import requestRoutes from './routes/requests.js'
import donationRoutes from './routes/donations.js'
import adminRoutes from './routes/admin.js'
import organPledgeRoutes from './routes/organPledges.js'
import aiRoutes from './routes/ai.js'
import { notFound, errorHandler } from './middleware/error.js'

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes)
app.use('/api/donors', donorRoutes)
app.use('/api/requests', requestRoutes)
app.use('/api/donations', donationRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/organ-pledges', organPledgeRoutes)
app.use('/api/ai', aiRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });

// const PORT = process.env.PORT || 5000

// connectDB()
//   .then(() => app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`)))
//   .catch((err) => {
//     console.error('Database connection failed:', err.message)
//     process.exit(1)
//   })
