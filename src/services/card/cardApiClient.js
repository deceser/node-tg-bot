import axios from "axios";
import logger from "../../utils/logger.js";
import { ROXY_API_CONFIG } from "../../utils/constants.js";
import { config } from "../../config/config.js";
import { CardFormatter } from "./cardFormatter.js";

// Cache of users' last cards to prevent repetitions
export const userLastCardCache = new Map();

export class CardApiClient {
  /**
   * Gets a tarot card from Roxy API
   * @returns {Promise<Object>} Card data
   */
  static async getCard() {
    try {
      const response = await axios.get(`${ROXY_API_CONFIG.BASE_URL}${ROXY_API_CONFIG.ENDPOINTS.TAROT_SINGLE_CARD}`, {
        params: {
          token: config.ROXY_API_TOKEN,
          reversed_probability: 0.3,
          include_image: true,
        },
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "TelegramBot/1.0",
        },
        timeout: ROXY_API_CONFIG.TIMEOUT,
      });

      if (!response.data || response.status !== 200) {
        throw new Error(`API Error: ${response.status} - ${JSON.stringify(response.data)}`);
      }

      logger.info("Received tarot card data:", {
        name: response.data.name,
        reversed: response.data.is_reversed,
        hasImage: !!response.data.image_url || !!response.data.image,
      });

      return CardFormatter.formatCardData(response.data);
    } catch (error) {
      logger.error("Error getting tarot card from API:", error.message);
      throw new Error("Could not retrieve tarot card");
    }
  }
}
