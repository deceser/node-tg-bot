const bot = require('./src/bot');
const config = require('./config/config');

console.log('Bot is starting...');
console.log(`Environment: ${config.NODE_ENV}`);

// Error handling
bot.on('error', (error) => {
  console.error('Telegram Bot Error:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});
