import app from "./app";
import { PORT } from "./config";
import { connectToDatabase } from "./database/mondodb";


async function startServer() {
  await connectToDatabase();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();