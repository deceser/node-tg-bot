import dotenv from "dotenv";
dotenv.config();

// Configuration object with environment variables
export const config = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/telegram-bot",
};
