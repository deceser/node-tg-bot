import axios from "axios";
import logger from "../utils/logger.js";

// Base URL for horoscope API
const HOROSCOPE_API_URL = "https://aztro.sameerkumar.website";

// API request timeout (in milliseconds)
const API_TIMEOUT = 10000; // Increased to 10 seconds

// Retry settings
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // Delay between retries in milliseconds

export class ApiService {
  /**
   * Gets the horoscope for the specified zodiac sign for the specified day
   * @param {string} sign - English zodiac sign (e.g., "aries")
   * @param {string} day - Day (today, tomorrow, yesterday)
   * @param {number} retryCount - Retry counter (for internal use)
   * @returns {Promise<Object>} Object with horoscope data
   */
  static async getHoroscope(sign, day = "today", retryCount = 0) {
    try {
      logger.info(`Fetching horoscope for ${sign} (${day}), attempt ${retryCount + 1}`);

      // Translating the sign name to lowercase and transliteration
      const translatedSign = ApiService.translateZodiacSign(sign);

      // POST request to the API (API requires POST, but in fact it's GET)
      const response = await axios.post(
        `${HOROSCOPE_API_URL}?sign=${translatedSign}&day=${day}`,
        {}, // empty request body
        {
          timeout: API_TIMEOUT,
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "TelegramBot/1.0",
            Accept: "application/json",
          },
        }
      );

      // Check the response status
      if (response.status !== 200) {
        throw new Error(`API responded with code ${response.status}: ${response.statusText}`);
      }

      if (!response.data) {
        throw new Error("Received empty response from API");
      }

      logger.info(`Successfully fetched horoscope for ${sign}`);
      return response.data;
    } catch (error) {
      // Check the possibility of retrying
      if (retryCount < MAX_RETRIES) {
        logger.warn(`Retry ${retryCount + 1} for horoscope API, sign: ${sign}`);

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));

        // Recursively call with an increased retry counter
        return ApiService.getHoroscope(sign, day, retryCount + 1);
      }

      // Different types of errors that can occur when requesting
      if (error.code === "ECONNABORTED") {
        logger.error(`Timeout error fetching horoscope for ${sign}:`, error);
        throw new Error(`Timeout error fetching horoscope for ${sign}`);
      } else if (error.response) {
        // Server responded with an error (status not 2xx)
        logger.error(`API error (${error.response.status}) for ${sign}:`, error.response.data);
        throw new Error(`API error (${error.response.status}): ${error.response.statusText}`);
      } else if (error.request) {
        // The request was made, but no response was received
        logger.error(`No response from horoscope API for ${sign}:`, error);
        throw new Error("Horoscope API server is not responding");
      } else {
        // Something went wrong when setting up the request
        logger.error(`Error fetching horoscope for ${sign}:`, error);
        throw new Error(`Failed to get horoscope for ${sign}: ${error.message}`);
      }
    }
  }

  /**
   * Translates the Russian zodiac sign name to English
   * @param {string} sign - Russian zodiac sign
   * @returns {string} English zodiac sign
   */
  static translateZodiacSign(sign) {
    const translations = {
      Овен: "aries",
      Телец: "taurus",
      Близнецы: "gemini",
      Рак: "cancer",
      Лев: "leo",
      Дева: "virgo",
      Весы: "libra",
      Скорпион: "scorpio",
      Стрелец: "sagittarius",
      Козерог: "capricorn",
      Водолей: "aquarius",
      Рыбы: "pisces",
    };

    return translations[sign] || sign.toLowerCase();
  }

  /**
   * Gets the horoscope from a fallback source in case the main API is unavailable
   * @param {string} sign - Zodiac sign
   * @returns {Promise<Object>} Object with horoscope data
   */
  static async getFallbackHoroscope(sign) {
    try {
      logger.info(`Using fallback horoscope for ${sign}`);

      // As a fallback, we use data from another API or a placeholder
      // Here you can add another API or return to local templates

      const dateRange = ApiService.getZodiacDateRange(sign);
      const currentDate = new Date().toISOString().split("T")[0];

      // Random data for variety in fallback horoscopes
      const moods = ["Inspired", "Energetic", "Calm", "Playful", "Reflective"];
      const colors = ["Синий", "Зеленый", "Красный", "Фиолетовый", "Желтый", "Оранжевый"];
      const numbers = ["2", "3", "5", "7", "9", "11", "13"];
      const times = ["8:00", "10:30", "12:15", "15:00", "18:45", "21:30"];
      const compatibles = ["Лев", "Весы", "Водолей", "Близнецы", "Стрелец", "Овен"];

      const randomIndex = arr => Math.floor(Math.random() * arr.length);

      const description = `Сегодня благоприятный день для ${sign}. Доверьтесь своей интуиции и следуйте внутреннему голосу. Возможны приятные новости или встречи.`;
      const compatibility = compatibles[randomIndex(compatibles)];
      const mood = moods[randomIndex(moods)];
      const color = colors[randomIndex(colors)];
      const luckyNumber = numbers[randomIndex(numbers)];
      const luckyTime = times[randomIndex(times)];

      // Формируем резервный гороскоп с разнообразными данными и правильной структурой полей
      return {
        sign: sign,
        date_range: dateRange,
        dateRange: dateRange,
        current_date: currentDate,
        date: currentDate,
        description: description,
        compatibility: compatibility,
        mood: mood,
        color: color,
        lucky_number: luckyNumber,
        luckyNumber: luckyNumber,
        lucky_time: luckyTime,
        luckyTime: luckyTime,
        // Add advice from description
        advice: "Listen to yourself and your desires.",
        // Add additional fields for compatibility with local format
        energy: `Energy of the day: ${mood}. ${description.split(".")[0]}.`,
        love: `Совместимость сегодня: ${compatibility}. Это хороший день для отношений.`,
        finance: `Удачное число: ${luckyNumber}. Благоприятное время для финансов: ${luckyTime}.`,
      };
    } catch (error) {
      logger.error(`Error in fallback horoscope for ${sign}:`, error);

      // In case of an error in the fallback, return a very simple horoscope
      // with the correct field structure
      const currentDate = new Date().toISOString().split("T")[0];
      return {
        sign: sign,
        date: currentDate,
        dateRange: ApiService.getZodiacDateRange(sign),
        date_range: ApiService.getZodiacDateRange(sign),
        current_date: currentDate,
        description: "Сегодня хороший день. Доверьтесь своим чувствам.",
        compatibility: "Все знаки",
        mood: "Нейтральный",
        color: "Любой",
        lucky_number: "7",
        luckyNumber: "7",
        lucky_time: "12:00",
        luckyTime: "12:00",
        advice: "Прислушивайтесь к интуиции",
        energy: "День будет наполнен энергией",
        love: "Благоприятный день для отношений",
        finance: "Стабильный день для финансов",
      };
    }
  }

  /**
   * Returns the date range for the zodiac sign
   * @param {string} sign - Zodiac sign in Russian
   * @returns {string} Date range
   */
  static getZodiacDateRange(sign) {
    const dateRanges = {
      Овен: "21 марта - 19 апреля",
      Телец: "20 апреля - 20 мая",
      Близнецы: "21 мая - 20 июня",
      Рак: "21 июня - 22 июля",
      Лев: "23 июля - 22 августа",
      Дева: "23 августа - 22 сентября",
      Весы: "23 сентября - 22 октября",
      Скорпион: "23 октября - 21 ноября",
      Стрелец: "22 ноября - 21 декабря",
      Козерог: "22 декабря - 19 января",
      Водолей: "20 января - 18 февраля",
      Рыбы: "19 февраля - 20 марта",
    };

    return dateRanges[sign] || "";
  }
}
