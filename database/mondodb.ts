import mongoose from 'mongoose';
import { MONGODB_URI } from '../config';

export async function connectToDatabase() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB successfully.");
    } catch (error) {
        console.error("Error connecting to MongoDB: ", error);
        process.exit(1);
    }
}