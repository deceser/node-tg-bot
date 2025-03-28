// src/bot.js
import express from "express";
import { Telegraf } from "telegraf";
import { config } from "./config/config.js";
import logger from "./utils/logger.js";
import { BOT_CONFIG, SERVER_CONFIG } from "./utils/constants.js";
import { setupMiddleware } from "./server/middleware.js";
import { setupRoutes } from "./server/routes.js";
import { setupCommands } from "./commands/setupCommands.js";

// Initialize Express app
const app = express();

// Setup Express middleware
setupMiddleware(app);

// Initialize bot with token
const bot = new Telegraf(config.BOT_TOKEN, BOT_CONFIG);

// Setup bot commands
setupCommands(bot).catch(error => {
  logger.error("Failed to setup commands:", error);
});

// Setup Express routes
setupRoutes(app, bot);

// Start Express server
app.listen(SERVER_CONFIG.PORT, () => {
  logger.info(`Server is running on port ${SERVER_CONFIG.PORT}`);
});

// Export bot and app for use in other modules
export { bot, app };
