// src/bot.js
import express from "express";
import { Telegraf } from "telegraf";
import { config } from "./config/config.js";
import logger from "./utils/logger.js";
import { BOT_CONFIG, SERVER_CONFIG, MESSAGES } from "./utils/constants.js";
import { setupMiddleware } from "./server/middleware.js";
import { setupRoutes } from "./server/routes.js";
import { setupCommands } from "./commands/setupCommands.js";
import { ReminderService } from "./services/reminderService.js";

// Initialize Express app
const app = express();

// Setup Express middleware
setupMiddleware(app);

// Create bot instance
const bot = new Telegraf(config.BOT_TOKEN);

// Log all messages for debugging
bot.use(async (ctx, next) => {
  logger.info("Received message:", {
    from: ctx.from?.id,
    text: ctx.message?.text,
  });
  await next();
});

// Setup error handling
bot.catch((err, ctx) => {
  logger.error("Bot error:", err);
  ctx.reply(MESSAGES.ERROR).catch(() => {});
});

// Initialize commands
setupCommands(bot);

// Setup Express routes
setupRoutes(app, bot);

// Load active reminders
ReminderService.loadActiveReminders(bot.telegram)
  .then(() => logger.info("Reminders loaded successfully"))
  .catch(err => logger.error("Failed to load reminders:", err));

// Start Express server
app.listen(SERVER_CONFIG.PORT, () => {
  logger.info(`Server is running on port ${SERVER_CONFIG.PORT}`);
});

// Export bot and app for use in other modules
export { bot, app };
