import express, { Application } from 'express';
import { PORT } from './config';
import { connectToDatabase } from './database/mondodb';

const app:Application = express();

async function startServer() {
        await connectToDatabase();
        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
}

startServer();