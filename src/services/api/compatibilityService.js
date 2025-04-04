import axios from "axios";
import logger from "../../utils/logger.js";
import { config } from "../../config/config.js";
import { ROXY_API_CONFIG } from "../../utils/constants.js";

/**
 * Service for interacting with compatibility API
 */
export class CompatibilityService {
  /**
   * Gets compatibility data between two birth charts
   * @param {string} birthdate1 - First person birth date
   * @param {string} birthtime1 - First person birth time
   * @param {string} birthdate2 - Second person birth date
   * @param {string} birthtime2 - Second person birth time
   * @returns {Promise<Object>} Compatibility data
   */
  static async getCompatibilityData(birthdate1, birthtime1, birthdate2, birthtime2) {
    try {
      // Validate parameters
      if (!birthdate1 || !birthtime1 || !birthdate2 || !birthtime2) {
        throw new Error("Missing required parameters for compatibility data");
      }

      logger.info("Getting compatibility data from RoxyAPI");

      // Parse first person data
      const [year1, month1, day1] = birthdate1.split("-");
      const [hour1, minute1] = birthtime1.split(":");

      // Parse second person data
      const [year2, month2, day2] = birthdate2.split("-");
      const [hour2, minute2] = birthtime2.split(":");

      const response = await axios.get(`${ROXY_API_CONFIG.BASE_URL}/astrology/compatibility`, {
        params: {
          token: config.ROXY_API_TOKEN,
          person1_year: parseInt(year1, 10),
          person1_month: parseInt(month1, 10),
          person1_day: parseInt(day1, 10),
          person1_hour: parseInt(hour1, 10),
          person1_minute: parseInt(minute1, 10),
          person2_year: parseInt(year2, 10),
          person2_month: parseInt(month2, 10),
          person2_day: parseInt(day2, 10),
          person2_hour: parseInt(hour2, 10),
          person2_minute: parseInt(minute2, 10),
        },
        headers: {
          "Content-Type": "application/json",
        },
        timeout: ROXY_API_CONFIG.TIMEOUT,
      });

      if (response.status !== 200 || !response.data) {
        throw new Error(`RoxyAPI responded with code ${response.status}`);
      }

      logger.info("Successfully retrieved compatibility data");
      return response.data;
    } catch (error) {
      logger.error(`Error fetching compatibility data: ${error.message}`);
      throw error;
    }
  }
}
