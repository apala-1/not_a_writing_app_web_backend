import mongoose from 'mongoose';
import { MONGODB_URI } from '../config';

export async function connectToDatabase() {
    try {
        console.log("Attempting to connect with URI:", MONGODB_URI);
        await mongoose.connect(MONGODB_URI, {
            dbName: "not_a_writing_app", 
        });
        console.log("Connected to MongoDB successfully.");
    } catch (error) {
        console.error("Error connecting to MongoDB: ", error);
        process.exit(1);
    }
}

export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
};