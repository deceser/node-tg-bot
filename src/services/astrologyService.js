import { AstrologyCommandHandler } from "./astrology/astrologyCommandHandler.js";
import { AstrologyFormHandler } from "./astrology/astrologyFormHandler.js";
import { AstrologyDataFormatter } from "./astrology/astrologyDataFormatter.js";
import { TarotCardHandler } from "./astrology/tarotCardHandler.js";
import { ZodiacUtils } from "./astrology/zodiacUtils.js";

export class AstrologyService {
  /**
   * Handles astrology command
   * @param {Object} ctx - Telegraf context
   */
  static async handleAstrologyCommand(ctx) {
    return AstrologyCommandHandler.handleAstrologyCommand(ctx);
  }

  /**
   * Handles click on astrology form button
   * @param {Object} ctx - Telegraf context
   */
  static async handleAstrologyForm(ctx) {
    return AstrologyFormHandler.handleAstrologyForm(ctx);
  }

  /**
   * Handles astrology form cancellation
   * @param {Object} ctx - Telegraf context
   */
  static async handleAstrologyCancel(ctx) {
    return AstrologyFormHandler.handleAstrologyCancel(ctx);
  }

  /**
   * Handles text input for astrology form
   * @param {Object} ctx - Telegraf context
   */
  static async handleTextInput(ctx) {
    return AstrologyFormHandler.handleTextInput(ctx);
  }

  /**
   * Gets astrology data from API
   * @param {Object} userData - User data with birthdate and birthtime
   * @returns {Promise<Object>} Astrology data object
   */
  static async getAstrologyData(userData) {
    return AstrologyDataFormatter.getAstrologyData(userData);
  }

  /**
   * Formats astrology data for display
   * @param {Object} data - Raw astrology data
   * @returns {string} Formatted text with markdown
   */
  static formatAstrologyData(data) {
    return AstrologyDataFormatter.formatAstrologyData(data);
  }

  /**
   * Gets symbol for zodiac sign
   * @param {string} sign - Zodiac sign name
   * @returns {string} Emoji symbol
   */
  static getZodiacSymbol(sign) {
    return ZodiacUtils.getZodiacSymbol(sign);
  }

  /**
   * Gets symbol for element
   * @param {string} element - Element name
   * @returns {string} Emoji symbol
   */
  static getElementSymbol(element) {
    return ZodiacUtils.getElementSymbol(element);
  }

  /**
   * Handles click on Tarot card button
   * @param {Object} ctx - Telegraf context
   */
  static async handleTarotCard(ctx) {
    return TarotCardHandler.handleTarotCard(ctx);
  }

  /**
   * Handle astrology data request from user
   * @param {Object} ctx - Telegraf context
   */
  static async handleAstrologyRequest(ctx) {
    return AstrologyCommandHandler.handleAstrologyRequest(ctx);
  }

  /**
   * Fetch astrology data for a user
   * @private
   */
  static async _fetchAstrologyData(userId, userSettings) {
    return AstrologyCommandHandler._fetchAstrologyData(userId, userSettings);
  }

  /**
   * Send formatted horoscope response to user
   * @private
   */
  static async _sendHoroscopeResponse(ctx, data) {
    return AstrologyCommandHandler._sendHoroscopeResponse(ctx, data);
  }
}

/**
 * Converts coordinates from DMS format to decimal
 * @param {string} dmsStr - Coordinate string in DMS format (e.g., 47°29'03")
 * @returns {number} Coordinate in decimal format
 */
