import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';   // ✅ import cors
import authRoutes from './routes/auth.route';
import userRoutes from './routes/admin/user.route';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';

dotenv.config();
console.log(process.env.PORT);

const app: Application = express();

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ✅ Add CORS middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'], // allowed origins
  credentials: true, // allow cookies/auth headers
};
app.use(cors(corsOptions));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

export default app;