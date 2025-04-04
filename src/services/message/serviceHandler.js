import logger from "../../utils/logger.js";
import { checkCardAvailability } from "../../data/userSettings.js";

export class ServiceHandler {
  /**
   * Handles horoscope request
   * @param {Object} ctx - Telegraf context
   */
  static async handleGetHoroscope(ctx) {
    // Этот метод будет заменен в index.js
    return "AstrologyService.handleAstrologyRequest";
  }

  /**
   * Handles button click or command for Tarot card
   * @param {Object} ctx - Telegraf context
   */
  static async handleTarotCommand(ctx) {
    const userId = ctx.from.id;
    logger.info("User requested tarot card", { userId });

    // Check card availability and handle unavailable scenario first
    const availability = checkCardAvailability(userId);
    if (!availability.freeAvailable) {
      // Возвращаем строку с данными для обработки в MessageService
      return `CARD_LIMIT_REACHED:false`;
    }

    // Возвращаем строку с данными для обработки в MessageService
    return `CARD_INTRO:true`;
  }
}
