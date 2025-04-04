import axios from "axios";
import logger from "../../utils/logger.js";
import { config } from "../../config/config.js";
import { ROXY_API_CONFIG } from "../../utils/constants.js";

/**
 * Service for interacting with houses API
 */
export class HousesService {
  /**
   * Gets astrological house data
   * @param {number} latitude - Location latitude
   * @param {number} longitude - Location longitude
   * @param {string} birthdate - Birth date
   * @param {string} birthtime - Birth time
   * @returns {Promise<Object>} Houses data
   */
  static async getHousesData(latitude, longitude, birthdate, birthtime) {
    try {
      // Validate parameters
      if (!latitude || !longitude || !birthdate || !birthtime) {
        throw new Error("Missing required parameters for houses data");
      }

      logger.info("Getting houses data from RoxyAPI");

      // Parse birthdate and birthtime
      const [year, month, day] = birthdate.split("-");
      const [hour, minute] = birthtime.split(":");

      const response = await axios.get(`${ROXY_API_CONFIG.BASE_URL}/astrology/houses`, {
        params: {
          token: config.ROXY_API_TOKEN,
          latitude,
          longitude,
          year: parseInt(year, 10),
          month: parseInt(month, 10),
          day: parseInt(day, 10),
          hour: parseInt(hour, 10),
          minute: parseInt(minute, 10),
          house_system: "placidus", // Default house system
        },
        headers: {
          "Content-Type": "application/json",
        },
        timeout: ROXY_API_CONFIG.TIMEOUT,
      });

      if (response.status !== 200 || !response.data) {
        throw new Error(`RoxyAPI responded with code ${response.status}`);
      }

      logger.info("Successfully retrieved houses data");
      return response.data;
    } catch (error) {
      logger.error(`Error fetching houses data: ${error.message}`);
      throw error;
    }
  }
}
