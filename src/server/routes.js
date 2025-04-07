import express from "express";

import logger from "../utils/logger.js";
import { config } from "../config/config.js";
import { MESSAGES } from "../utils/constants.js";

export const setupRoutes = (app, bot) => {
  logger.info("Setting up API routes");
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
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // // Маршрут для веб-приложения с кнопками навигации
  // router.get("/menu", (req, res) => {
  //   const html = `
  //     <!DOCTYPE html>
  //     <html lang="ru">
  //     <head>
  //       <meta charset="UTF-8">
  //       <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //       <title> навигации</title>
  //       <script src="https://telegram.org/js/telegram-web-app.js"></script>
  //       <style>
  //         body {
  //           font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  //           background-color: var(--tg-theme-bg-color, #ffffff);
  //           color: var(--tg-theme-text-color, #222222);
  //           margin: 0;
  //           padding: 0;
  //           display: flex;
  //           flex-direction: column;
  //           height: 100vh;
  //         }
  //         .container {
  //           display: grid;
  //           grid-template-columns: 1fr 1fr;
  //           grid-gap: 10px;
  //           padding: 16px;
  //           max-width: 480px;
  //           margin: 0 auto;
  //           width: 100%;
  //         }
  //         .button {
  //           display: flex;
  //           align-items: center;
  //           justify-content: center;
  //           background-color: var(--tg-theme-button-color, #5288c1);
  //           color: var(--tg-theme-button-text-color, #ffffff);
  //           border-radius: 10px;
  //           padding: 12px;
  //           text-align: center;
  //           cursor: pointer;
  //           font-size: 16px;
  //         }
  //         .button:active {
  //           opacity: 0.8;
  //         }
  //       </style>
  //     </head>
  //     <body>
  //       <div class="container">
  //         <div class="button" onclick="sendCommand('get_astrology')">
  //           🔮 ${MESSAGES.GET_HOROSCOPE}
  //         </div>
  //         <div class="button" onclick="sendCommand('tarot')">
  //           🎴 ${MESSAGES.TAROT_BUTTON}
  //         </div>
  //         <div class="button" onclick="sendCommand('settings')">
  //           ⚙️ Настройки
  //         </div>
  //         <div class="button" onclick="sendCommand('help')">
  //           ❓ Помощь
  //         </div>
  //       </div>
  //       <script>
  //         const tg = window.Telegram.WebApp;
  //         tg.expand();

  //         function sendCommand(command) {
  //           tg.sendData(command);
  //           tg.close();
  //         }

  //         tg.onEvent('viewportChanged', () => {
  //           tg.expand();
  //         });
  //       </script>
  //     </body>
  //     </html>
  //   `;

  //   res.send(html);
  // });

  app.use("/api", router);
  logger.info("API routes setup complete");
};
