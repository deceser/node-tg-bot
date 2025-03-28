// src/bot.js
import { Telegraf } from 'telegraf';
import express from 'express';
import { config } from '../config/config.js';

// Initialize Express app
const app = express();
app.use(express.json());

// Initialize bot with token
const bot = new Telegraf(config.BOT_TOKEN);

// Handle /start command
bot.start((ctx) => {
  ctx.reply('Привет! Я ваш персональный помощник. Чем могу помочь?');
});

// Handle /help command
bot.help((ctx) => {
  ctx.reply(
    'Я умею выполнять простые задачи: отправлять напоминания, планировать встречи и даже переводить голосовые сообщения. Напишите мне что-нибудь!',
  );
});

// Simple text message handler
bot.hears(/.*/, (ctx) => {
  // Here you can add any text processing logic
  ctx.reply(`Вы написали: ${ctx.message.text}`);
});

// Set up webhook
app.post(`/webhook/${config.BOT_TOKEN}`, (req, res) => {
  bot.handleUpdate(req.body);
  res.sendStatus(200);
});

// Start Express server
const PORT = config.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Start bot
bot.launch();

// Export bot and app for use in other modules
export { bot, app };
