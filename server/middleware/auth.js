import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import asyncHandler from '../utils/asyncHandler.js'

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ message: 'Not authenticated' })

  // 1. Check JWT_SECRET before verifying the token
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured')
  }

  let payload
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }

  const user = await User.findById(payload.id)
  if (!user) return res.status(401).json({ message: 'User no longer exists' })
  if (user.isBlocked) return res.status(403).json({ message: 'Account is blocked' })
  req.user = user
  next()
})

export const authorize = (...roles) => (req, res, next) => {
  // 2. Guard against missing req.user before checking roles
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' })
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' })
  next()
}