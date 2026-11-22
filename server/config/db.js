import mongoose from 'mongoose'
import dns from 'node:dns'

// Fix for Node.js / ISP DNS refusing SRV queries (querySrv ECONNREFUSED)
try {
  dns.setServers(['8.8.8.8', '8.8.4.4'])
} catch {
  // Ignore if custom DNS servers are not permitted in some cloud environments
}

export default async function connectDB() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not set')
  await mongoose.connect(process.env.MONGO_URI)
  console.log('MongoDB connected')
}