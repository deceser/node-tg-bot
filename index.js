// index.js
import "dotenv/config";
import mongoose from "mongoose";

import { bot } from "./src/bot.js";
import { config } from "./src/config/config.js";
import logger from "./src/utils/logger.js";
import { Reminder } from "./src/models/Reminder.js";

// MongoDB connection
const connectDB = async () => {
  try {
    logger.info(`Attempting to connect to MongoDB at ${config.MONGODB_URI}`);

    // Connection parameters setup
    await mongoose.connect(config.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Reduced timeout for quick connection check
      autoCreate: true, // Automatically create collections
    });

    logger.info("Connected to MongoDB successfully");

    // Check connection status
    if (mongoose.connection.readyState !== 1) {
      logger.error(`MongoDB connection state is ${mongoose.connection.readyState} (expected 1)`);
      return false;
    }

    // Ensure indexes are created
    await Reminder.init();

    return true;
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    return false;
  }
};

// Start the bot
const startBot = async () => {
  try {
    // Connect to the database
    const dbConnected = await connectDB();

    if (!dbConnected) {
      logger.error("Failed to connect to MongoDB, exiting application");
      process.exit(1);
    }

    logger.info("Bot is starting...");
    logger.info(`Environment: ${config.NODE_ENV}`);

    // Launch the bot
    await bot.launch();
    logger.info("Bot started successfully");
  } catch (error) {
    logger.error("Failed to start bot:", error);
    process.exit(1);
  }
};

// Launch the application
startBot();

// Graceful shutdown
const shutdown = async signal => {
  logger.info(`Received ${signal}, starting graceful shutdown...`);
  try {
    await bot.stop();
    await mongoose.connection.close();
    logger.info("Bot and DB connections closed successfully");
    process.exit(0);
  } catch (error) {
    logger.error("Error during shutdown:", error);
    process.exit(1);
  }
};

// Signal handlers
process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

// Error handling
process.on("uncaughtException", error => {
  logger.error("Uncaught Exception:", error);
  shutdown("uncaughtException");
});

process.on("unhandledRejection", error => {
  logger.error("Unhandled Rejection:", error);
  shutdown("unhandledRejection");
});
