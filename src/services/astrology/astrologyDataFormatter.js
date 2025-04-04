import logger from "../../utils/logger.js";
import { ApiService } from "../apiService.js";
import { ZodiacUtils } from "./zodiacUtils.js";

export class AstrologyDataFormatter {
  /**
   * Gets astrology data from API
   * @param {Object} userData - User data with birthdate and birthtime
   * @returns {Promise<Object>} Astrology data object
   */
  static async getAstrologyData(userData) {
    try {
      logger.info("Getting astrology data");

      // Extract user data
      const { birthdate, birthtime } = userData;

      // Create API request
      const result = await ApiService.getAstrologyData(birthdate, birthtime);

      logger.info("Successfully retrieved astrology data");
      return result;
    } catch (error) {
      logger.error("Error getting astrology data:", error);
      throw error;
    }
  }

  /**
   * Formats astrology data for display
   * @param {Object} data - Raw astrology data
   * @returns {string} Formatted text with markdown
   */
  static formatAstrologyData(data) {
    try {
      if (!data || !data.zodiac) {
        return "Could not get astrology data. Please try again later.";
      }

      // Get zodiac sign and element information
      const zodiacSign = data.zodiac?.name || "Unknown";
      const zodiacSymbol = ZodiacUtils.getZodiacSymbol(zodiacSign);
      const element = data.element?.name || "Unknown";
      const elementSymbol = ZodiacUtils.getElementSymbol(element);

      // Get personality characteristics
      const qualities = data.personality?.qualities || [];
      const strengths = data.personality?.strengths || [];
      const weaknesses = data.personality?.weaknesses || [];

      // Format personality text
      let personalityText = "";
      if (qualities.length > 0) {
        personalityText += "Your main characteristics:\n• " + qualities.join("\n• ") + "\n\n";
      }
      if (strengths.length > 0) {
        personalityText += "Your strengths:\n• " + strengths.join("\n• ") + "\n\n";
      }
      if (weaknesses.length > 0) {
        personalityText += "Areas for improvement:\n• " + weaknesses.join("\n• ") + "\n\n";
      }

      // Format period information
      let periodText = "";
      if (data.period && data.period.description) {
        periodText = `*Current period:*\n${data.period.description}\n\n`;
      }

      // Get compatibility information
      const compatibility = data.compatibility || {};
      let compatibilityText = "";
      if (compatibility.best && compatibility.best.length > 0) {
        compatibilityText += `*Best compatibility with:* ${compatibility.best.join(", ")}\n`;
      }
      if (compatibility.worst && compatibility.worst.length > 0) {
        compatibilityText += `*Challenging compatibility with:* ${compatibility.worst.join(", ")}\n`;
      }

      // Format the final text
      const formattedText =
        `${zodiacSymbol} *Your Zodiac Sign: ${zodiacSign}* ${zodiacSymbol}\n` +
        `${elementSymbol} *Element: ${element}*\n\n` +
        `${periodText}` +
        `${personalityText}` +
        `${compatibilityText}`;

      return formattedText;
    } catch (error) {
      logger.error("Error formatting astrology data:", error);
      return "Error processing astrology data.";
    }
  }
}
