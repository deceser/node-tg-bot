import dotenv from "dotenv";
dotenv.config();

// Configuration object with environment variables
export const config = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  ROXY_API_TOKEN: process.env.ROXY_API_TOKEN,
  // Admin IDs для доступа к административным функциям
  // (разделенный запятыми список в .env файле: ADMIN_IDS=123456789,987654321)
  ADMIN_IDS: process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(",") : [],
};
