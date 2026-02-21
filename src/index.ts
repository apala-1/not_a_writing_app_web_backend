import app from "./app";
import http from "http";
import { PORT } from "./config";
import { connectToDatabase } from "./database/mondodb";
import { initSocket } from "./config/socket/socket";

const server = http.createServer(app);
initSocket(server);

async function startServer() {
  await connectToDatabase();
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();