import mongoose from "mongoose";
import { connectToDatabase } from "../database/mondodb";

// before all test starts
beforeAll(async () => {
    // can connect new database for testing, 
    // or use the same database as development
    await connectToDatabase();
});

afterAll(async () => {
    // close database connection after all tests
    await mongoose.connection.close();
});