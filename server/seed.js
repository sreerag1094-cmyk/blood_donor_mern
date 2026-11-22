import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import dns from 'node:dns'
import User from './models/User.js'
import Donor from './models/Donor.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })
dotenv.config({ path: path.join(__dirname, '../.env') })
dotenv.config()

try {
  dns.setServers(['8.8.8.8', '8.8.4.4'])
} catch {}

const email = process.env.ADMIN_EMAIL || 'admin@blooddonor.local'
const password = process.env.ADMIN_PASSWORD || 'Admin@12345'

await mongoose.connect(process.env.MONGO_URI)

const existingAdmin = await User.findOne({ email }).select('+password')
if (!existingAdmin) {
  await User.create({ name: 'Administrator', email, password, role: 'admin' })
  console.log(`Admin created: ${email}`)
} else {
  existingAdmin.password = password
  existingAdmin.role = 'admin'
  existingAdmin.isBlocked = false
  await existingAdmin.save()
  console.log(`Admin updated and synced: ${email}`)
}

if ((await Donor.countDocuments()) === 0) {
  const samples = [
    ['Aarav Nair', 'aarav@example.com', 'O+', 24, 'male', 'Kochi', 'Kerala'],
    ['Meera Menon', 'meera@example.com', 'A-', 29, 'female', 'Kochi', 'Kerala'],
    ['Sanjay Pillai', 'sanjay@example.com', 'B+', 35, 'male', 'Thrissur', 'Kerala'],
  ]
  for (const [name, mail, bloodGroup, age, gender, city, state] of samples) {
    const user = await User.create({ name, email: mail, password: 'Donor@12345', role: 'donor', phone: '9000000000' })
    await Donor.create({ user: user._id, bloodGroup, age, gender, city, state, status: 'approved' })
  }
  console.log('Sample donors created (password: Donor@12345)')
}

await mongoose.disconnect()
