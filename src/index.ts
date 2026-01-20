import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth.route';
import dotenv from 'dotenv';
import { PORT } from './config';
import { connectToDatabase } from './database/mondodb';

dotenv.config();
console.log(process.env.PORT);

const app: Application = express();

app.use(bodyParser.json());

app.use('/api/auth', authRoutes);

async function startServer() {
    await connectToDatabase();
    app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
    });
}

startServer();