import fs from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

import logger from "../utils/logger.js";
import { formatDate } from "../utils/validation.js";

// Setup data path
const __dirname = dirname(fileURLToPath(import.meta.url));
const dataFilePath = join(__dirname, "../../data/users.json");

// In-memory storage for user settings
let userSettings = {};

// Default user settings
const DEFAULT_USER_SETTINGS = {
  name: null,
  birthdate: null,
  birthtime: null,
  personalDataSet: false,
  cardLastUsed: null,
  preferences: {
    notifications: true,
    language: "en",
  },
};

/**
 * Load user settings from file if exists
 */
function loadUserSettings() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const data = fs.readFileSync(dataFilePath, "utf8");
      const parsed = JSON.parse(data);
      userSettings = parsed.users || {};
      logger.info("User settings loaded successfully");
    } else {
      logger.info("User settings file not found, using empty settings");
      userSettings = {};
    }
  } catch (error) {
    logger.error("Error loading user settings:", { error: error.message });
    userSettings = {};
  }
}

/**
 * Save user settings to file
 */
function saveUserSettingsToFile() {
  try {
    // Ensure directory exists
    const dir = dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(dataFilePath, JSON.stringify({ users: userSettings }, null, 2), "utf8");
    logger.info("User settings saved to file");
    return true;
  } catch (error) {
    logger.error("Error saving user settings to file:", { error: error.message });
    return false;
  }
}

// Load settings on module initialization
loadUserSettings();

/**
 * Gets user settings by ID, creating default settings if not found
 * @param {string|number} userId - The user ID
 * @returns {Object} User settings object
 */
export function getUserSettings(userId) {
  if (!userId) {
    logger.warn("Attempted to get settings with no userId");
    return { ...DEFAULT_USER_SETTINGS };
  }

  try {
    // Auto-create user if not exists
    if (!userSettings[userId]) {
      userSettings[userId] = { ...DEFAULT_USER_SETTINGS };
      // Async save without blocking
      setTimeout(() => saveUserSettingsToFile(), 0);
    }

    return userSettings[userId];
  } catch (error) {
    logger.error("Error getting user settings:", { userId, error: error.message });
    return { ...DEFAULT_USER_SETTINGS };
  }
}

/**
 * Saves user settings
 * @param {string|number} userId - The user ID
 * @param {Object} settings - Settings to save (partial)
 * @returns {boolean} Success status
 */
export function saveUserSettings(userId, settings) {
  if (!userId) {
    logger.warn("Attempted to save settings with no userId");
    return false;
  }

  try {
    // Get current settings or create new
    const currentSettings = userSettings[userId] || { ...DEFAULT_USER_SETTINGS };

    // Update settings
    userSettings[userId] = {
      ...currentSettings,
      ...settings,
    };

    // Async save without blocking
    setTimeout(() => saveUserSettingsToFile(), 0);
    return true;
  } catch (error) {
    logger.error("Error saving user settings:", { userId, error: error.message });
    return false;
  }
}

/**
 * Checks if a user can draw a card today
 * @param {string|number} userId - The user ID
 * @returns {Object} Object with card availability status
 */
export function checkCardAvailability(userId) {
  try {
    const settings = getUserSettings(userId);
    const today = formatDate(new Date());

    // Check if the user has used their free card today
    const freeAvailable = settings.cardLastUsed !== today;

    return {
      freeAvailable,
    };
  } catch (error) {
    logger.error("Error checking card availability:", { userId, error: error.message });
    // Default to no availability on error
    return {
      freeAvailable: false,
    };
  }
}

/**
 * Saves card usage for a user
 * @param {string|number} userId - The user ID
 * @returns {boolean} Success status
 */
export function saveCardUsage(userId) {
  try {
    const today = formatDate(new Date());

    return saveUserSettings(userId, {
      cardLastUsed: today,
    });
  } catch (error) {
    logger.error("Error saving card usage:", { userId, error: error.message });
    return false;
  }
}
