// src/bot.js
import express from "express";
import { Telegraf, session } from "telegraf";

import { config } from "./config/config.js";
import { setupCommands } from "./commands/setupCommands.js";

import logger from "./utils/logger.js";
import { BOT_CONFIG, SERVER_CONFIG } from "./utils/constants.js";

import { setupRoutes } from "./server/routes.js";
import { setupMiddleware } from "./server/middleware.js";

// Create a set for tracking recent user requests
const recentRequests = new Map();
const DUPLICATION_THRESHOLD = 2000; // Threshold in ms for determining duplicate requests

// Initialize Express app
const app = express();

// Setup Express middleware
setupMiddleware(app);

// Initialize bot with token
const bot = new Telegraf(config.BOT_TOKEN, BOT_CONFIG);

// Add session and middleware for protecting against duplication
bot.use(session());

// Middleware for detecting and blocking duplicate requests
bot.use(async (ctx, next) => {
  try {
    if (!ctx.from) {
      return next();
    }

    const userId = ctx.from.id;

    // For callback queries, check for similar requests in recent history
    if (ctx.callbackQuery) {
      const data = ctx.callbackQuery.data;
      const requestKey = `${userId}:${data}`;
      const lastRequest = recentRequests.get(requestKey);
      const now = Date.now();

      if (lastRequest && now - lastRequest < DUPLICATION_THRESHOLD) {
        logger.info(`Ignoring duplicate callback request: ${data}`, { userId });
        try {
          await ctx.answerCbQuery("Запрос уже обрабатывается...");
        } catch (error) {
          // Ignore callback response errors
        }
        return; // Don't pass the request further
      }

      // Update the time of the last request
      recentRequests.set(requestKey, now);

      // Clean up old records after some time
      setTimeout(() => {
        if (recentRequests.get(requestKey) === now) {
          recentRequests.delete(requestKey);
        }
      }, DUPLICATION_THRESHOLD * 2);
    }

    return next();
  } catch (error) {
    logger.error("Error in duplication middleware:", error);
    return next();
  }
});

// Setup bot commands
try {
  setupCommands(bot);
  logger.info("Commands setup successfully");
} catch (error) {
  logger.error("Failed to setup commands:", error);
}

// Setup Express routes
setupRoutes(app, bot);

// Start Express server
app.listen(SERVER_CONFIG.PORT, () => {
  logger.info(`Server is running on port ${SERVER_CONFIG.PORT}`);
});

// Export bot and app for use in other modules
export { bot, app };
