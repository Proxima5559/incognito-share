import mongoose from 'mongoose';
import { config } from '../utils/configVar.js';
const MONGO_URI = config.mongoUrl;

if (!MONGO_URI) {
  console.error('Define an URL of MongoDB');
  process.exit(1);
}


export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected ');
  } catch (error) {
    console.error('MongoDB connection error', error);
    process.exit(1);
  }
};