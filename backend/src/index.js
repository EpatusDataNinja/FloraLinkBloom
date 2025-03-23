const dotenv = require("dotenv");
const { createServer } = require('http');
const app = require("./app");
const setupSocket = require('./socket/socketSetup');
const reportsRouter = require('./routers/reportsRouter');
const db = require('./database/models');
const initializeOrderEvents = require('./events/orderEvents');

dotenv.config();
const PORT = process.env.PORT || 5000;

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database and load models
    await db.initializeDatabase();

    // Create HTTP server
    const server = createServer(app);

    // Setup Socket.IO
    const io = setupSocket(server);

    // Store instances in app
    app.set('io', io);
    app.set('db', db);

    // Add reports router
    app.use('/api/v1/reports', reportsRouter);

    // Initialize events after database and models are ready
    initializeOrderEvents();
    console.log('Order events initialized successfully');

    // Start server
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});
