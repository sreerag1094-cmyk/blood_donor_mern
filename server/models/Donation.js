import mongoose from 'mongoose'

const donationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: true },
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
    donationDate: { type: Date, required: true },
    location: { type: String, required: true, trim: true },
    units: { type: Number, default: 1, min: 1, max: 2 },
    notes: { type: String, maxlength: 200 },
  },
  { timestamps: true }
)

export default mongoose.model('Donation', donationSchema)
