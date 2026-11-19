import { Router } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = Router()

const sign = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })

// POST /api/auth/register  (public registrations are always donors)
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' })
    }
    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(409).json({ message: 'Email is already registered' })
    }
    const user = await User.create({ name, email, password, phone, role: 'donor' })
    res.status(201).json({ token: sign(user), user: user.toPublic() })
  })
)

// POST /api/auth/login
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' })
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    if (user.isBlocked) return res.status(403).json({ message: 'Account is blocked' })
    res.json({ token: sign(user), user: user.toPublic() })
  })
)

// GET /api/auth/me
router.get('/me', protect, (req, res) => res.json({ user: req.user.toPublic() }))

export default router
