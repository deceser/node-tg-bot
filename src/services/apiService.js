import { AstrologyService } from "./api/astrologyService.js";
import { HousesService } from "./api/housesService.js";
import { TransitService } from "./api/transitService.js";
import { CompatibilityService } from "./api/compatibilityService.js";
import { ZodiacUtils } from "./api/utils/zodiacUtils.js";

/**
 * Service for interacting with external APIs
 */
export class ApiService {
  /**
   * Gets astrology data from external API
   * @param {string} name - User's name
   * @param {string} birthdate - Birth date in YYYY-MM-DD format
   * @param {string} birthtime - Birth time in HH:MM format
   * @returns {Promise<Object>} Astrology data
   */
  static async getAstrologyData(name, birthdate, birthtime) {
    return AstrologyService.getAstrologyData(name, birthdate, birthtime);
  }

  /**
   * Gets astrological house data
   * @param {number} latitude - Location latitude
   * @param {number} longitude - Location longitude
   * @param {string} birthdate - Birth date
   * @param {string} birthtime - Birth time
   * @returns {Promise<Object>} Houses data
   */
  static async getHousesData(latitude, longitude, birthdate, birthtime) {
    return HousesService.getHousesData(latitude, longitude, birthdate, birthtime);
  }

  /**
   * Gets transit data
   * @param {string} birthdate - Birth date
   * @param {string} birthtime - Birth time
   * @returns {Promise<Object>} Transit data
   */
  static async getTransitData(birthdate, birthtime) {
    return TransitService.getTransitData(birthdate, birthtime);
  }

  /**
   * Gets compatibility data between two birth charts
   * @param {string} birthdate1 - First person birth date
   * @param {string} birthtime1 - First person birth time
   * @param {string} birthdate2 - Second person birth date
   * @param {string} birthtime2 - Second person birth time
   * @returns {Promise<Object>} Compatibility data
   */
  static async getCompatibilityData(birthdate1, birthtime1, birthdate2, birthtime2) {
    return CompatibilityService.getCompatibilityData(birthdate1, birthtime1, birthdate2, birthtime2);
  }

  /**
   * Returns mock astrology data for testing
   * @param {Object} params - Request parameters
   * @returns {Object} Mock astrology data
   */
  static getMockAstrologyData(params) {
    return AstrologyService.getMockAstrologyData(params);
  }

  /**
   * Translates the Russian zodiac sign name to English
   * @param {string} sign - Russian zodiac sign
   * @returns {string} English zodiac sign
   */
  static translateZodiacSign(sign) {
    return ZodiacUtils.translateZodiacSign(sign);
  }

  /**
   * Returns the date range for the zodiac sign
   * @param {string} sign - Zodiac sign in Russian
   * @returns {string} Date range
   */
  static getZodiacDateRange(sign) {
    return ZodiacUtils.getZodiacDateRange(sign);
  }
}
