import axios from "axios";
import { drawRandomCard } from "../data/cards.js";
import logger from "../utils/logger.js";

// Example API for getting cards (this is a placeholder, you need to replace it with a real API)
const CARD_API_URL = "https://api.example.com/tarot-cards";

// Timeout and retry settings
const API_TIMEOUT = 10000;
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

export class CardApiService {
  /**
   * Gets a unique card from the API
   * @param {string} excludeId - ID карты, которую нужно исключить
   * @returns {Promise<Object>} Объект с данными карты
   */
  static async getUniqueCard(excludeId = null, retryCount = 0) {
    try {
      logger.info(`Fetching unique card from API, attempt ${retryCount + 1}`);

      // API request
      const response = await axios.get(CARD_API_URL, {
        timeout: API_TIMEOUT,
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "TelegramBot/1.0",
        },
        params: {
          exclude: excludeId,
        },
      });

      // Check the status and presence of data
      if (response.status !== 200 || !response.data) {
        throw new Error(`API responded with code ${response.status} or returned empty data`);
      }

      // Format the data to the correct format
      const cardData = CardApiService.formatApiResponse(response.data);

      logger.info(`Successfully fetched unique card from API`);
      return cardData;
    } catch (error) {
      // Check the possibility of retrying
      if (retryCount < MAX_RETRIES) {
        logger.warn(`Retry ${retryCount + 1} for card API`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return CardApiService.getUniqueCard(excludeId, retryCount + 1);
      }

      // Log the error and return the local card
      logger.error("Error fetching card from API, using local fallback:", error);
      return drawRandomCard(excludeId);
    }
  }

  /**
   * Formats the API response to the correct format for the bot
   * @param {Object} apiResponse - Response from the API
   * @returns {Object} Formatted card object
   */
  static formatApiResponse(apiResponse) {
    // Here we assume a certain structure of the API response
    // You need to adapt it to the real API

    try {
      const card = apiResponse.card || apiResponse;

      return {
        id: card.id || `api_card_${Date.now()}`,
        name: card.name || "Неизвестная карта",
        image: card.image_url || null,
        prediction: card.description || card.meaning || "Эта карта говорит о неожиданных изменениях в вашей жизни.",
        fromApi: true,
      };
    } catch (error) {
      logger.error("Error formatting API response:", error);
      // Return a simple card in case of an error
      return {
        id: `fallback_${Date.now()}`,
        name: "Мистическая карта",
        image: null,
        prediction: "Сегодня вас ждет что-то особенное. Будьте внимательны к знакам вокруг.",
        fromApi: true,
      };
    }
  }
}
