import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import logger from "../utils/logger.js";

// Get absolute path to the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the horoscope cache file
const HOROSCOPE_CACHE_FILE = path.join(__dirname, "horoscopeCache.json");

// Cache time (in milliseconds) - 24 hours
const CACHE_TTL = 24 * 60 * 60 * 1000;

/**
 * Initializes the cache file if it doesn't exist
 */
const initCacheFile = () => {
  try {
    if (!fs.existsSync(HOROSCOPE_CACHE_FILE)) {
      fs.writeFileSync(HOROSCOPE_CACHE_FILE, JSON.stringify({}), "utf8");
      logger.info("Created horoscope cache file");
      return true;
    }

    // Check the file content
    const fileContent = fs.readFileSync(HOROSCOPE_CACHE_FILE, "utf8");
    if (!fileContent || fileContent.trim() === "") {
      // The file exists, but is empty
      fs.writeFileSync(HOROSCOPE_CACHE_FILE, JSON.stringify({}), "utf8");
      logger.info("Reinitialized empty horoscope cache file");
    }
    return true;
  } catch (error) {
    logger.error("Error initializing cache file:", error);
    // Try to recreate the file
    try {
      fs.writeFileSync(HOROSCOPE_CACHE_FILE, JSON.stringify({}), "utf8");
      logger.info("Recreated horoscope cache file after error");
      return true;
    } catch (retryError) {
      logger.error("Failed to recreate cache file:", retryError);
      return false;
    }
  }
};

/**
 * Gets the cache data
 * @returns {Object} Cache data or an empty object in case of an error
 */
const getCache = () => {
  try {
    const success = initCacheFile();
    if (!success) return {};

    const fileContent = fs.readFileSync(HOROSCOPE_CACHE_FILE, "utf8");
    if (!fileContent || fileContent.trim() === "") return {};

    return JSON.parse(fileContent);
  } catch (error) {
    logger.error("Error reading cache file:", error);
    return {};
  }
};

/**
 * Generates a cache key based on the zodiac sign and date
 * @param {string} zodiacSign - Zodiac sign
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {string} Cache key
 */
const getCacheKey = (zodiacSign, date) => {
  return `${zodiacSign}_${date}`;
};

/**
 * Gets the horoscope from the cache
 * @param {string} zodiacSign - Zodiac sign
 * @returns {Object|null} Object with horoscope or null if cache is missing or outdated
 */
export const getCachedHoroscope = zodiacSign => {
  try {
    const cache = getCache();
    const today = new Date().toISOString().split("T")[0];
    const cacheKey = getCacheKey(zodiacSign, today);

    if (cache[cacheKey]) {
      const cachedData = cache[cacheKey];
      const cacheTime = new Date(cachedData.timestamp);
      const now = new Date();

      // Check the cache validity
      if (now.getTime() - cacheTime.getTime() < CACHE_TTL) {
        logger.info(`Using cached horoscope for ${zodiacSign}`);
        return cachedData.data;
      } else {
        logger.info(`Cache expired for ${zodiacSign}`);
      }
    }

    return null;
  } catch (error) {
    logger.error("Error reading horoscope cache:", error);
    return null;
  }
};

/**
 * Saves the horoscope to the cache
 * @param {string} zodiacSign - Zodiac sign
 * @param {Object} horoscopeData - Horoscope data
 * @returns {boolean} Success of the operation
 */
export const cacheHoroscope = (zodiacSign, horoscopeData) => {
  try {
    const cache = getCache();
    const today = new Date().toISOString().split("T")[0];
    const cacheKey = getCacheKey(zodiacSign, today);

    cache[cacheKey] = {
      timestamp: new Date().toISOString(),
      data: horoscopeData,
    };

    fs.writeFileSync(HOROSCOPE_CACHE_FILE, JSON.stringify(cache, null, 2), "utf8");
    logger.info(`Cached horoscope for ${zodiacSign}`);
    return true;
  } catch (error) {
    logger.error("Error caching horoscope:", error);
    return false;
  }
};

/**
 * Cleans up outdated entries in the cache
 * @returns {boolean} Success of the operation
 */
export const cleanupCache = () => {
  try {
    const cache = getCache();
    const now = new Date().getTime();
    let cleanedEntries = 0;

    Object.keys(cache).forEach(key => {
      const cacheTime = new Date(cache[key].timestamp).getTime();
      if (now - cacheTime > CACHE_TTL) {
        delete cache[key];
        cleanedEntries++;
      }
    });

    fs.writeFileSync(HOROSCOPE_CACHE_FILE, JSON.stringify(cache, null, 2), "utf8");
    if (cleanedEntries > 0) {
      logger.info(`Cleaned up ${cleanedEntries} expired cache entries`);
    }
    return true;
  } catch (error) {
    logger.error("Error cleaning up horoscope cache:", error);
    return false;
  }
};
