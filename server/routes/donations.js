import { Router } from 'express'
import Donor from '../models/Donor.js'
import Donation from '../models/Donation.js'
import { protect, authorize } from '../middleware/auth.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = Router()
router.use(protect, authorize('donor'))

const ownDonor = (req) => Donor.findOne({ user: req.user._id })

// GET /api/donations/mine
router.get(
  '/mine',
  asyncHandler(async (req, res) => {
    const donor = await ownDonor(req)
    if (!donor) return res.json([])
    res.json(await Donation.find({ donor: donor._id }).sort({ donationDate: -1 }))
  })
)

// POST /api/donations/mine
router.post(
  '/mine',
  asyncHandler(async (req, res) => {
    const donor = await ownDonor(req)
    if (!donor) return res.status(404).json({ message: 'Create your donor profile first' })
    const { donationDate, location, units, notes, request } = req.body
    const donation = await Donation.create({ donor: donor._id, donationDate, location, units, notes, request })
    // Keep the donor's "last donation" in sync with their newest record.
    const latest = await Donation.findOne({ donor: donor._id }).sort({ donationDate: -1 })
    donor.lastDonationDate = latest.donationDate
    await donor.save()
    res.status(201).json(donation)
  })
)

// DELETE /api/donations/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const donor = await ownDonor(req)
    const donation = donor && (await Donation.findOneAndDelete({ _id: req.params.id, donor: donor._id }))
    if (!donation) return res.status(404).json({ message: 'Donation not found' })
    // Re-sync "last donation" after a removal.
    const latest = await Donation.findOne({ donor: donor._id }).sort({ donationDate: -1 })
    donor.lastDonationDate = latest ? latest.donationDate : undefined
    await donor.save()
    res.json({ ok: true })
  })
)

export default router
