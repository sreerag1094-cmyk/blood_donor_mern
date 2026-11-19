import mongoose from 'mongoose'

export const ORGANS_LIST = [
  'All Organs & Tissues',
  'Heart',
  'Kidneys',
  'Liver',
  'Lungs',
  'Pancreas',
  'Intestines',
  'Corneas (Eyes)',
  'Skin & Tissues',
  'Heart Valves & Bone',
]

const organPledgeSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    age: { type: Number, min: 18, max: 100, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    bloodGroup: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    organsPledged: {
      type: [String],
      required: true,
      validate: [(v) => v.length > 0, 'Select at least one organ to pledge'],
    },
    emergencyContactName: { type: String, trim: true },
    emergencyContactPhone: { type: String, trim: true },
    emergencyContactRelation: { type: String, trim: true },
    pledgeId: { type: String, unique: true, required: true },
    nottoReferralClicked: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

organPledgeSchema.index({ email: 1 })
organPledgeSchema.index({ pledgeId: 1 })

export default mongoose.model('OrganPledge', organPledgeSchema)
