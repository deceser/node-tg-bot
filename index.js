// index.js
import "dotenv/config";

import { bot } from "./src/bot.js";
import { config } from "./src/config/config.js";
import logger from "./src/utils/logger.js";

// Graceful shutdown function
const shutdown = async signal => {
  logger.info(`Received ${signal}, starting graceful shutdown...`);
  try {
    await bot.stop(signal);
    logger.info("Bot stopped successfully");
    process.exit(0);
  } catch (error) {
    logger.error("Error during shutdown:", error);
    process.exit(1);
  }
};

// Handle termination signals
process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

// Error handling for bot operations
bot.on("error", error => {
  logger.error("Telegram Bot Error:", error);
});

// Global error handlers
process.on("uncaughtException", error => {
  logger.error("Uncaught Exception:", error);
  shutdown("uncaughtException");
});

process.on("unhandledRejection", error => {
  logger.error("Unhandled Rejection:", error);
  shutdown("unhandledRejection");
});

// Start the bot
const startBot = async () => {
  try {
    logger.info("Bot is starting...");
    logger.info(`Environment: ${config.NODE_ENV}`);

    await bot.launch();

    logger.info("Bot is running...");
  } catch (error) {
    logger.error("Failed to start bot:", error);
    process.exit(1);
  }
};

startBot();
