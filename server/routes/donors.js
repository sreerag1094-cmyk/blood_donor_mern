import { Router } from 'express'
import Donor from '../models/Donor.js'
import { protect, authorize } from '../middleware/auth.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = Router()

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// GET /api/donors?bloodGroup=O+&city=kochi&available=true   (public, approved donors only)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { bloodGroup, city, available } = req.query
    const filter = { status: 'approved' }
    if (bloodGroup) filter.bloodGroup = bloodGroup
    if (city) filter.city = new RegExp(escapeRegex(city), 'i')
    if (available === 'true') filter.available = true
    const donors = await Donor.find(filter)
      .populate('user', 'name')
      .select('-__v')
      .sort({ createdAt: -1 })
    res.json(donors)
  })
)

// GET /api/donors/me  (logged-in donor's own profile; null if not created yet)
router.get(
  '/me',
  protect,
  authorize('donor'),
  asyncHandler(async (req, res) => {
    const donor = await Donor.findOne({ user: req.user._id })
    res.json(donor)
  })
)

// PUT /api/donors/me  (create or update own profile)
router.put(
  '/me',
  protect,
  authorize('donor'),
  asyncHandler(async (req, res) => {
    const { bloodGroup, age, gender, city, state, lastDonationDate, bio, available } = req.body
    const fields = { bloodGroup, age, gender, city, state, lastDonationDate, bio, available }
    Object.keys(fields).forEach((k) => fields[k] === undefined && delete fields[k])

    let donor = await Donor.findOne({ user: req.user._id })
    if (donor) {
      donor.set(fields)
      // Changing blood group or city sends the profile back for re-approval.
      if (donor.isModified('bloodGroup') || donor.isModified('city')) donor.status = 'pending'
      await donor.save()
    } else {
      donor = await Donor.create({ ...fields, user: req.user._id })
    }
    res.json(donor)
  })
)

// PATCH /api/donors/me/availability
router.patch(
  '/me/availability',
  protect,
  authorize('donor'),
  asyncHandler(async (req, res) => {
    const donor = await Donor.findOneAndUpdate(
      { user: req.user._id },
      { available: !!req.body.available },
      { new: true }
    )
    if (!donor) return res.status(404).json({ message: 'Create your donor profile first' })
    res.json(donor)
  })
)

// GET /api/donors/:id  (public, approved only)
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const donor = await Donor.findOne({ _id: req.params.id, status: 'approved' }).populate('user', 'name')
    if (!donor) return res.status(404).json({ message: 'Donor not found' })
    res.json(donor)
  })
)

export default router
