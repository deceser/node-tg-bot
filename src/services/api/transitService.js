import axios from "axios";
import logger from "../../utils/logger.js";
import { config } from "../../config/config.js";
import { ROXY_API_CONFIG } from "../../utils/constants.js";

/**
 * Service for interacting with transits API
 */
export class TransitService {
  /**
   * Gets transit data
   * @param {string} birthdate - Birth date
   * @param {string} birthtime - Birth time
   * @returns {Promise<Object>} Transit data
   */
  static async getTransitData(birthdate, birthtime) {
    try {
      // Validate parameters
      if (!birthdate || !birthtime) {
        throw new Error("Missing required parameters for transit data");
      }

      logger.info("Getting transit data from RoxyAPI");

      // Parse birthdate and birthtime
      const [year, month, day] = birthdate.split("-");
      const [hour, minute] = birthtime.split(":");

      // Get current date for transit calculation
      const now = new Date();
      const transitYear = now.getFullYear();
      const transitMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
      const transitDay = now.getDate();
      const transitHour = now.getHours();
      const transitMinute = now.getMinutes();

      const response = await axios.get(`${ROXY_API_CONFIG.BASE_URL}/astrology/transits`, {
        params: {
          token: config.ROXY_API_TOKEN,
          natal_year: parseInt(year, 10),
          natal_month: parseInt(month, 10),
          natal_day: parseInt(day, 10),
          natal_hour: parseInt(hour, 10),
          natal_minute: parseInt(minute, 10),
          transit_year: transitYear,
          transit_month: transitMonth,
          transit_day: transitDay,
          transit_hour: transitHour,
          transit_minute: transitMinute,
        },
        headers: {
          "Content-Type": "application/json",
        },
        timeout: ROXY_API_CONFIG.TIMEOUT,
      });

      if (response.status !== 200 || !response.data) {
        throw new Error(`RoxyAPI responded with code ${response.status}`);
      }

      logger.info("Successfully retrieved transit data");
      return response.data;
    } catch (error) {
      logger.error(`Error fetching transit data: ${error.message}`);
      throw error;
    }
  }
}
