import dotenv from "dotenv";
import { createServer } from 'http';
import app from "./app.js";
import setupSocket from './socket/socketSetup.js';
import reportsRouter from './routers/reportsRouter.js';

dotenv.config();
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = createServer(app);

// Setup Socket.IO
const io = setupSocket(server);

// Store io instance in app
app.set('io', io);

// Add reports router
app.use('/api/v1/reports', reportsRouter);

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
