import { Router } from 'express'
import Donor from '../models/Donor.js'
import Request from '../models/Request.js'
import { protect, authorize } from '../middleware/auth.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = Router()

// POST /api/requests  (public: anyone can contact an approved donor)
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { donorId, requesterName, requesterPhone, requesterEmail, hospital, city, message } = req.body
    const donor = await Donor.findOne({ _id: donorId, status: 'approved' })
    if (!donor) return res.status(404).json({ message: 'Donor not found' })
    if (!donor.available) return res.status(409).json({ message: 'Donor is currently unavailable' })

    const request = await Request.create({
      donor: donor._id,
      bloodGroup: donor.bloodGroup,
      requesterName,
      requesterPhone,
      requesterEmail,
      hospital,
      city,
      message,
    })
    res.status(201).json(request)
  })
)

// GET /api/requests/mine  (requests sent to the logged-in donor)
router.get(
  '/mine',
  protect,
  authorize('donor'),
  asyncHandler(async (req, res) => {
    const donor = await Donor.findOne({ user: req.user._id })
    if (!donor) return res.json([])
    res.json(await Request.find({ donor: donor._id }).sort({ createdAt: -1 }))
  })
)

// PATCH /api/requests/:id  { status: accepted | declined | completed }
router.patch(
  '/:id',
  protect,
  authorize('donor'),
  asyncHandler(async (req, res) => {
    const { status } = req.body
    if (!['accepted', 'declined', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }
    const donor = await Donor.findOne({ user: req.user._id })
    const request = donor && (await Request.findOne({ _id: req.params.id, donor: donor._id }))
    if (!request) return res.status(404).json({ message: 'Request not found' })
    request.status = status
    await request.save()
    res.json(request)
  })
)

export default router
