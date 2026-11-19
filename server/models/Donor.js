import mongoose from 'mongoose'

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const donorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
    age: { type: Number, min: 18, max: 65, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    lastDonationDate: { type: Date },
    available: { type: Boolean, default: true },
    bio: { type: String, maxlength: 300 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
)

donorSchema.index({ bloodGroup: 1, city: 1 })

export default mongoose.model('Donor', donorSchema)
