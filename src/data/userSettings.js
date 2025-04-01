import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the absolute path to the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the file storing user settings
const USER_SETTINGS_FILE = path.join(__dirname, "userSettings.json");

// User settings structure
const defaultUserSettings = {
  zodiacSign: null,
  autoHoroscope: false,
  lastCardDate: null,
  cardUsageToday: 0,
  paidCards: 0,
  language: "ru",
};

/**
 * Initializes the settings file if it doesn't exist
 */
const initSettingsFile = () => {
  if (!fs.existsSync(USER_SETTINGS_FILE)) {
    fs.writeFileSync(USER_SETTINGS_FILE, JSON.stringify({}), "utf8");
  }
};

/**
 * Gets user settings
 * @param {number} userId - User ID
 * @returns {Object} Object with user settings
 */
export const getUserSettings = userId => {
  initSettingsFile();

  try {
    const settings = JSON.parse(fs.readFileSync(USER_SETTINGS_FILE, "utf8"));
    return settings[userId] || { ...defaultUserSettings };
  } catch (error) {
    console.error("Error reading user settings:", error);
    return { ...defaultUserSettings };
  }
};

/**
 * Saves user settings
 * @param {number} userId - User ID
 * @param {Object} settings - Settings to save
 */
export const saveUserSettings = (userId, settings) => {
  initSettingsFile();

  try {
    const allSettings = JSON.parse(fs.readFileSync(USER_SETTINGS_FILE, "utf8"));
    allSettings[userId] = {
      ...getUserSettings(userId),
      ...settings,
    };
    fs.writeFileSync(USER_SETTINGS_FILE, JSON.stringify(allSettings, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error saving user settings:", error);
    return false;
  }
};

/**
 * Gets a list of users with auto horoscope sending enabled
 * @returns {Array} Array of user IDs with auto horoscope sending enabled
 */
export const getUsersWithAutoHoroscope = () => {
  initSettingsFile();

  try {
    const settings = JSON.parse(fs.readFileSync(USER_SETTINGS_FILE, "utf8"));
    return Object.entries(settings)
      .filter(([, userData]) => userData.autoHoroscope && userData.zodiacSign)
      .map(([userId]) => parseInt(userId, 10));
  } catch (error) {
    console.error("Error getting users with auto horoscope:", error);
    return [];
  }
};

/**
 * Checks if card drawing is available for the user
 * @param {number} userId - User ID
 * @returns {Object} Object with information about card availability
 */
export const checkCardAvailability = userId => {
  const settings = getUserSettings(userId);
  const today = new Date().toISOString().split("T")[0];
  const lastCardDate = settings.lastCardDate ? new Date(settings.lastCardDate).toISOString().split("T")[0] : null;

  // If today is not yet card drawing or this is the first request
  if (lastCardDate !== today) {
    return {
      available: true,
      freeAvailable: true,
      paidAvailable: true,
      freeCardsLeft: 1,
      paidCards: settings.paidCards || 0,
    };
  }

  // Если уже брали бесплатную карту сегодня
  const cardUsageToday = settings.cardUsageToday || 0;
  return {
    available: true,
    freeAvailable: cardUsageToday < 1,
    paidAvailable: true,
    freeCardsLeft: Math.max(0, 1 - cardUsageToday),
    paidCards: settings.paidCards || 0,
  };
};

/**
 * Updates the card usage counter
 * @param {number} userId - User ID
 * @param {boolean} isPaid - Whether the card is paid
 * @returns {boolean} Success of the operation
 */
export const updateCardUsage = (userId, isPaid = false) => {
  const settings = getUserSettings(userId);
  const today = new Date().toISOString().split("T")[0];
  const lastCardDate = settings.lastCardDate ? new Date(settings.lastCardDate).toISOString().split("T")[0] : null;

  let cardUsageToday = settings.cardUsageToday || 0;
  let paidCards = settings.paidCards || 0;

  // Reset the counter if a new day has started
  if (lastCardDate !== today) {
    cardUsageToday = 0;
  }

  if (isPaid) {
    // Decrease the paid card counter
    paidCards = Math.max(0, paidCards - 1);
  } else {
    // Increase the free card usage counter
    cardUsageToday++;
  }

  return saveUserSettings(userId, {
    lastCardDate: new Date().toISOString(),
    cardUsageToday,
    paidCards,
  });
};
