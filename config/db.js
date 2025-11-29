import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config({ path: '../config.env' })

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('database connected successfully')
  } catch (err) {
    console.log('unable to connect database', err)
  }
}

export { connectDB }