// index.js
import 'dotenv/config';
import { bot, app } from './src/bot.js';
import { config } from './config/config.js';

console.log('Bot is starting...');
console.log(`Environment: ${config.NODE_ENV}`);

// Error handling for bot operations
bot.on('error', (error) => {
  console.error('Telegram Bot Error:', error);
});

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

// Start the bot
bot.launch();

console.log('Bot is running...');

// Handle termination signals to properly stop the bot
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
