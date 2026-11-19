import express from 'express'
import OrganPledge from '../models/OrganPledge.js'
import asyncHandler from '../utils/asyncHandler.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// Optional auth helper to attach user if logged in
const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return next()
  try {
    const jwt = (await import('jsonwebtoken')).default
    const User = (await import('../models/User.js')).default
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(payload.id)
  } catch {
    // Ignore invalid tokens for public pledge submissions
  }
  next()
}

// @desc    Submit an organ donation pledge
// @route   POST /api/organ-pledges
// @access  Public
router.post(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const {
      fullName,
      email,
      phone,
      age,
      gender,
      bloodGroup,
      city,
      state,
      organsPledged,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
    } = req.body

    if (!fullName || !email || !phone || !age || !gender || !city || !state) {
      return res.status(400).json({ message: 'Please fill in all required fields' })
    }

    if (!organsPledged || organsPledged.length === 0) {
      return res.status(400).json({ message: 'Please select at least one organ/tissue to pledge' })
    }

    // Generate unique pledge ID e.g. NOTTO-LL-84920
    const randomCode = Math.floor(10000 + Math.random() * 90000)
    const pledgeId = `NOTTO-LL-${randomCode}`

    const pledge = await OrganPledge.create({
      fullName,
      email,
      phone,
      age: Number(age),
      gender,
      bloodGroup: bloodGroup || 'Unknown',
      city,
      state,
      organsPledged,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      pledgeId,
      user: req.user?._id || null,
    })

    res.status(201).json({
      success: true,
      message: 'Organ pledge registered successfully',
      pledge,
      nottoUrl: 'https://notto.mohfw.gov.in/donor-pledge',
    })
  })
)

// @desc    Get aggregate statistics of organ pledges
// @route   GET /api/organ-pledges/stats
// @access  Public
router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const totalPledges = await OrganPledge.countDocuments()
    res.json({
      totalPledges: totalPledges + 1240, // Base national awareness count + real pledges
      realPledges: totalPledges,
      officialPortal: 'https://notto.mohfw.gov.in/donor-pledge',
      helpline: '1800-11-4770 (NOTTO Toll-Free 24x7)',
    })
  })
)

// @desc    Get my pledges (for logged-in user)
// @route   GET /api/organ-pledges/my
// @access  Private
router.get(
  '/my',
  protect,
  asyncHandler(async (req, res) => {
    const pledges = await OrganPledge.find({
      $or: [{ user: req.user._id }, { email: req.user.email }],
    }).sort('-createdAt')
    res.json(pledges)
  })
)

// @desc    Get all pledges (Admin only)
// @route   GET /api/organ-pledges
// @access  Private/Admin
router.get(
  '/',
  protect,
  authorize('admin'),
  asyncHandler(async (_req, res) => {
    const pledges = await OrganPledge.find().sort('-createdAt').limit(100)
    res.json(pledges)
  })
)

export default router
