import cron from "node-cron";
import { HoroscopeService } from "./horoscopeService.js";
import { getUserSettings } from "../data/userSettings.js";
import { cleanupCache } from "../data/horoscopeCache.js";
import logger from "../utils/logger.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the absolute path to the user settings directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USER_SETTINGS_FILE = path.join(__dirname, "..", "data", "userSettings.json");

export class SchedulerService {
  // Save the scheduler instance
  static scheduler = null;

  /**
   * Initializes the scheduler tasks
   * @param {Object} bot - The bot instance
   */
  static initScheduler(bot) {
    logger.info("Initializing scheduler");

    // Cancel the previous scheduler if it exists
    if (SchedulerService.scheduler) {
      SchedulerService.scheduler.stop();
    }

    // Create a new scheduler
    SchedulerService.scheduler = {};

    // Task to send daily horoscopes at 8:00 AM
    // Cron syntax: seconds minutes hours day month day_of_week
    SchedulerService.scheduler.dailyHoroscope = cron.schedule("0 0 8 * * *", () => {
      SchedulerService.sendDailyHoroscopes(bot);
    });

    // Task to clean up outdated cache data every day at 3:00 AM
    SchedulerService.scheduler.cleanupCache = cron.schedule("0 0 3 * * *", () => {
      SchedulerService.cleanupCacheTask();
    });

    logger.info("Scheduler initialized with tasks");
  }

  /**
   * Sends daily horoscopes to all users who have auto horoscope sending enabled
   * @param {Object} bot - The bot instance
   */
  static async sendDailyHoroscopes(bot) {
    try {
      logger.info("Running daily horoscope task");

      // Get user settings data from storage
      const settings = JSON.parse(fs.readFileSync(USER_SETTINGS_FILE, "utf8"));

      // Iterate through all users
      for (const userId in settings) {
        const userSettings = settings[userId];

        // If the user has enabled auto horoscope sending and specified a zodiac sign
        if (userSettings.autoHoroscope && userSettings.zodiacSign) {
          try {
            await HoroscopeService.sendDailyHoroscope(bot, parseInt(userId));
            logger.info(`Sent daily horoscope to user ${userId}`);
          } catch (error) {
            logger.error(`Error sending horoscope to user ${userId}:`, error);
          }
        }
      }
    } catch (error) {
      logger.error("Error running daily horoscope task:", error);
    }
  }

  /**
   * Task to clean up outdated horoscope cache
   */
  static cleanupCacheTask() {
    try {
      logger.info("Running cache cleanup task");

      // Call the cache cleanup function
      const result = cleanupCache();

      if (result) {
        logger.info("Cache cleanup completed successfully");
      } else {
        logger.warn("Cache cleanup completed with issues");
      }
    } catch (error) {
      logger.error("Error running cache cleanup task:", error);
    }
  }
}
