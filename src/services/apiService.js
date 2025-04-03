import axios from "axios";
import logger from "../utils/logger.js";
import { config } from "../config/config.js";
import { ROXY_API_CONFIG } from "../utils/constants.js";

/**
 * Service for interacting with external APIs
 */
export class ApiService {
  /**
   * Gets astrology data from external API
   * @param {string} birthdate - Birth date in YYYY-MM-DD format
   * @param {string} birthtime - Birth time in HH:MM format
   * @returns {Promise<Object>} Astrology data
   */
  static async getAstrologyData(birthdate, birthtime) {
    try {
      logger.info("Getting astrology data from RoxyAPI");

      // Проверяем наличие и формат даты рождения
      if (!birthdate) {
        throw new Error("Birthdate is required");
      }

      // Преобразуем время в формат HH:MM:SS для API
      const timeOfBirth = birthtime ? `${birthtime}:00` : "12:00:00";

      // Используем POST запрос к endpoint personality согласно документации
      const response = await axios.post(
        `${ROXY_API_CONFIG.BASE_URL}/astrology/personality`,
        {
          // Отправляем данные в формате, соответствующем документации
          name: "User",
          birthdate: birthdate,
          time_of_birth: timeOfBirth,
        },
        {
          params: {
            token: config.ROXY_API_TOKEN,
          },
          headers: {
            "Content-Type": "application/json",
          },
          timeout: ROXY_API_CONFIG.TIMEOUT,
        }
      );

      if (response.status !== 200 || !response.data) {
        throw new Error(`RoxyAPI responded with code ${response.status}`);
      }

      // Проверяем наличие ошибки в ответе
      if (response.data.error) {
        throw new Error(response.data.error);
      }

      logger.info("Successfully retrieved astrology data");

      // Форматируем ответ в структуру, ожидаемую приложением
      const formattedResponse = {
        zodiac: {
          name: response.data.zodiac_sign || "Unknown",
        },
        element: {
          name: response.data.element || "Unknown",
        },
        personality: {
          qualities:
            typeof response.data.personality === "string"
              ? [response.data.personality]
              : Array.isArray(response.data.personality)
                ? response.data.personality
                : [],
        },
      };

      return formattedResponse;
    } catch (error) {
      logger.error(`Error fetching astrology data: ${error.message}`);
      throw error;
    }
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

  /**
   * Gets transit data
   * @param {string} birthdate - Birth date
   * @param {string} birthtime - Birth time
   * @returns {Promise<Object>} Transit data
   */
  static async getTransitData(birthdate, birthtime) {
    try {
      // Validate parameters
      if (!birthdate || !birthtime) {
        throw new Error("Missing required parameters for transit data");
      }

      logger.info("Getting transit data from RoxyAPI");

      // Parse birthdate and birthtime
      const [year, month, day] = birthdate.split("-");
      const [hour, minute] = birthtime.split(":");

      // Get current date for transit calculation
      const now = new Date();
      const transitYear = now.getFullYear();
      const transitMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
      const transitDay = now.getDate();
      const transitHour = now.getHours();
      const transitMinute = now.getMinutes();

      const response = await axios.get(`${ROXY_API_CONFIG.BASE_URL}/astrology/transits`, {
        params: {
          token: config.ROXY_API_TOKEN,
          natal_year: parseInt(year, 10),
          natal_month: parseInt(month, 10),
          natal_day: parseInt(day, 10),
          natal_hour: parseInt(hour, 10),
          natal_minute: parseInt(minute, 10),
          transit_year: transitYear,
          transit_month: transitMonth,
          transit_day: transitDay,
          transit_hour: transitHour,
          transit_minute: transitMinute,
        },
        headers: {
          "Content-Type": "application/json",
        },
        timeout: ROXY_API_CONFIG.TIMEOUT,
      });

      if (response.status !== 200 || !response.data) {
        throw new Error(`RoxyAPI responded with code ${response.status}`);
      }

      logger.info("Successfully retrieved transit data");
      return response.data;
    } catch (error) {
      logger.error(`Error fetching transit data: ${error.message}`);
      throw error;
    }
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

  /**
   * Возвращает мок-данные по астрологии для тестирования
   * @param {Object} params - Параметры запроса
   * @returns {Object} Мок-данные астрологии
   */
  static getMockAstrologyData(params) {
    // Создаем основные данные натальной карты
    const mockData = {
      name: params.name,
      birthdate: params.birthdate,
      birthtime: params.birthtime,
      sun_sign: "Водолей", // Для даты 1997-02-08
      moon_sign: "Близнецы",
      ascendant: "Дева",
      symbol: "♒",
      element: "Воздух",
      birth_chart: {
        planets: [
          { name: "Солнце", sign: "Водолей", degree: "19.5", house: "6" },
          { name: "Луна", sign: "Близнецы", degree: "12.3", house: "10" },
          { name: "Меркурий", sign: "Водолей", degree: "5.7", house: "6" },
          { name: "Венера", sign: "Козерог", degree: "28.9", house: "5" },
          { name: "Марс", sign: "Весы", degree: "15.2", house: "2" },
          { name: "Юпитер", sign: "Водолей", degree: "10.1", house: "6" },
          { name: "Сатурн", sign: "Овен", degree: "2.8", house: "8" },
        ],
        aspects: [
          { planet1: "Солнце", type: "трин", planet2: "Марс" },
          { planet1: "Луна", type: "квадрат", planet2: "Венера" },
          { planet1: "Меркурий", type: "соединение", planet2: "Юпитер" },
          { planet1: "Венера", type: "оппозиция", planet2: "Сатурн" },
          { planet1: "Марс", type: "квадрат", planet2: "Юпитер" },
        ],
      },
      sign_details: {
        name: "Aquarius",
        symbol: "♒",
        start_date: "20 января",
        end_date: "18 февраля",
        element: "Воздух",
        modality: "Фиксированный",
      },
      personality:
        "Ваша натальная карта показывает сильное влияние Водолея, что указывает на творческий потенциал и нестандартное мышление. Соединение Меркурия и Юпитера в 6 доме даёт хорошие аналитические способности и склонность к получению новых знаний.",
    };

    return mockData;
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
