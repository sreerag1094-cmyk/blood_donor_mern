import mongoose from 'mongoose'
import { BLOOD_GROUPS } from './Donor.js'

const requestSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: true },
    requesterName: { type: String, required: true, trim: true },
    requesterPhone: { type: String, required: true, trim: true },
    requesterEmail: { type: String, trim: true, lowercase: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
    hospital: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    message: { type: String, maxlength: 500 },
    status: { type: String, enum: ['pending', 'accepted', 'declined', 'completed'], default: 'pending' },
  },
  { timestamps: true }
)

export default mongoose.model('Request', requestSchema)
