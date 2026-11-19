import { Router } from 'express'
import User from '../models/User.js'
import Donor from '../models/Donor.js'
import Request from '../models/Request.js'
import Donation from '../models/Donation.js'
import OrganPledge from '../models/OrganPledge.js'
import { protect, authorize } from '../middleware/auth.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = Router()
router.use(protect, authorize('admin'))

// GET /api/admin/stats
router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const [users, donors, pending, requests, donations, organPledges, byGroup] = await Promise.all([
      User.countDocuments({ role: 'donor' }),
      Donor.countDocuments({ status: 'approved' }),
      Donor.countDocuments({ status: 'pending' }),
      Request.countDocuments(),
      Donation.countDocuments(),
      OrganPledge.countDocuments(),
      Donor.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ])
    res.json({ users, donors, pending, requests, donations, organPledges, byGroup })
  })
)

// GET /api/admin/donors?status=pending
router.get(
  '/donors',
  asyncHandler(async (req, res) => {
    const filter = req.query.status ? { status: req.query.status } : {}
    res.json(await Donor.find(filter).populate('user', 'name email phone').sort({ createdAt: -1 }))
  })
)

// PATCH /api/admin/donors/:id/status  { status: approved | rejected | pending }
router.patch(
  '/donors/:id/status',
  asyncHandler(async (req, res) => {
    const { status } = req.body
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }
    const donor = await Donor.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate(
      'user',
      'name email phone'
    )
    if (!donor) return res.status(404).json({ message: 'Donor not found' })
    res.json(donor)
  })
)

// GET /api/admin/users
router.get(
  '/users',
  asyncHandler(async (_req, res) => {
    res.json(await User.find({ role: 'donor' }).sort({ createdAt: -1 }))
  })
)

// PATCH /api/admin/users/:id/block  { isBlocked: boolean }
router.patch(
  '/users/:id/block',
  asyncHandler(async (req, res) => {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'donor' },
      { isBlocked: !!req.body.isBlocked },
      { new: true }
    )
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  })
)

// DELETE /api/admin/users/:id  (cascades to donor profile, requests, donations)
router.delete(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const user = await User.findOneAndDelete({ _id: req.params.id, role: 'donor' })
    if (!user) return res.status(404).json({ message: 'User not found' })
    const donor = await Donor.findOneAndDelete({ user: user._id })
    if (donor) {
      await Promise.all([Request.deleteMany({ donor: donor._id }), Donation.deleteMany({ donor: donor._id })])
    }
    res.json({ ok: true })
  })
)

export default router
