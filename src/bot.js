// src/bot.js
import express from "express";
import { Telegraf } from "telegraf";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";

import { config } from "../config/config.js";
import logger from "./utils/logger.js";

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("combined"));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Initialize bot with token
const bot = new Telegraf(config.BOT_TOKEN, {
  handlerTimeout: 90000, // 90 seconds
  polling: {
    interval: 300, // 300ms
    autoStart: false, // Don't start polling automatically
  },
});

// Handle /start command
bot.start(ctx => {
  logger.info("User started the bot", { userId: ctx.from.id });
  ctx.reply("Привет! Я ваш персональный помощник. Чем могу помочь?");
});

// Handle /help command
bot.help(ctx => {
  logger.info("User requested help", { userId: ctx.from.id });
  ctx.reply(
    "Я умею выполнять простые задачи: отправлять напоминания, планировать встречи и даже переводить голосовые сообщения. Напишите мне что-нибудь!"
  );
});

// Simple text message handler
bot.hears(/.*/, ctx => {
  logger.info("Received message", {
    userId: ctx.from.id,
    message: ctx.message.text,
  });
  ctx.reply(`Вы написали: ${ctx.message.text}`);
});

// Set up webhook
app.post(`/webhook/${config.BOT_TOKEN}`, (req, res) => {
  try {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
  } catch (error) {
    logger.error("Error handling webhook", { error: error.message });
    res.sendStatus(500);
  }
});

// Start Express server
const PORT = config.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

// Export bot and app for use in other modules
export { bot, app };
