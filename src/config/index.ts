import dotenv from "dotenv";
dotenv.config();

export const PORT: number = 
    process.env.PORT ? parseInt(process.env.PORT) : 3000;

export const MONGODB_URI = 
    process.env.MONGODB_URI ?? "mongodb://localhost:27017/defaultdb";