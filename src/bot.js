const TelegramBot = require('node-telegram-bot-api');
const config = require('../config/config');

const bot = new TelegramBot(config.BOT_TOKEN, { polling: true });

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Привет! Я ваш новый бот. 👋');
});

// Handle all messages
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  if (msg.text && !msg.text.startsWith('/')) {
    bot.sendMessage(chatId, `Вы написали: ${msg.text}`);
  }
});

module.exports = bot;
