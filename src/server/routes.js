import express from "express";

import logger from "../utils/logger.js";
import { config } from "../config/config.js";

export const setupRoutes = (app, bot) => {
  const router = express.Router();

  // Webhook endpoint for Telegram
  router.post(`/webhook/${config.BOT_TOKEN}`, (req, res) => {
    try {
      bot.handleUpdate(req.body);
      res.sendStatus(200);
    } catch (error) {
      logger.error("Error handling webhook", { error: error.message });
      res.sendStatus(500);
    }
  });

  // Health check endpoint
  router.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use(router);
};
