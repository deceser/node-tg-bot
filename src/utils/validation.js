/**
 * Utility functions for validating user input
 */

/**
 * Checks if a string is a valid date in YYYY-MM-DD format
 * @param {string} dateString - The date string to validate
 * @returns {boolean} Whether the date is valid
 */
export function checkValidDateFormat(dateString) {
  // Check format with regex
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }

  // Check if it's a valid date
  const [year, month, day] = dateString.split("-").map(Number);

  // Month is 0-indexed in JS Date
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

/**
 * Checks if a string is a valid time in HH:MM format (24h)
 * @param {string} timeString - The time string to validate
 * @returns {boolean} Whether the time is valid
 */
export function checkValidTimeFormat(timeString) {
  // Check format with regex
  if (!/^\d{2}:\d{2}$/.test(timeString)) {
    return false;
  }

  // Extract hours and minutes
  const [hours, minutes] = timeString.split(":").map(Number);

  // Validate range
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

/**
 * Formats a date object to YYYY-MM-DD string
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Formats a time object to HH:MM string
 * @param {Date} date - The date object containing the time to format
 * @returns {string} Formatted time string
 */
export function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

/**
 * Parses a date string in YYYY-MM-DD format to a Date object
 * @param {string} dateString - The date string to parse
 * @returns {Date|null} Date object or null if invalid
 */
export function parseDate(dateString) {
  if (!checkValidDateFormat(dateString)) {
    return null;
  }

  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Combines date and time strings into a single Date object
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @param {string} timeString - Time in HH:MM format
 * @returns {Date|null} Combined date and time or null if invalid
 */
export function combineDateAndTime(dateString, timeString) {
  if (!checkValidDateFormat(dateString) || !checkValidTimeFormat(timeString)) {
    return null;
  }

  const [year, month, day] = dateString.split("-").map(Number);
  const [hours, minutes] = timeString.split(":").map(Number);

  return new Date(year, month - 1, day, hours, minutes);
}
