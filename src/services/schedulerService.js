import cron from "node-cron";
import { getUserSettings } from "../data/userSettings.js";
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

    logger.info("Scheduler initialized with tasks");
  }
}
