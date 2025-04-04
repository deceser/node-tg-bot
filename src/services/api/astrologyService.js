import axios from "axios";
import logger from "../../utils/logger.js";
import { config } from "../../config/config.js";
import { ROXY_API_CONFIG } from "../../utils/constants.js";

/**
 * Service for interacting with astrology API
 */
export class AstrologyService {
  /**
   * Gets astrology data from external API
   * @param {string} name - User's name
   * @param {string} birthdate - Birth date in YYYY-MM-DD format
   * @param {string} birthtime - Birth time in HH:MM format
   * @returns {Promise<Object>} Astrology data
   */
  static async getAstrologyData(name, birthdate, birthtime) {
    try {
      logger.info("Getting astrology data from RoxyAPI");

      // Check the presence and format of birth date
      if (!birthdate) {
        throw new Error("Birthdate is required");
      }

      // Convert time to HH:MM:SS format for API
      const timeOfBirth = birthtime ? `${birthtime}:00` : "12:00:00";

      // Use POST request to personality endpoint according to documentation
      const response = await axios.post(
        `${ROXY_API_CONFIG.BASE_URL}${ROXY_API_CONFIG.ENDPOINTS.PERSONALITY}`,
        {
          // Send data in the format compatible with documentation
          name: name || "User",
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

      // Check for errors in the response
      if (response.data.error) {
        throw new Error(response.data.error);
      }

      logger.info("Successfully retrieved astrology data");

      // Format the response into the structure expected by the application
      return {
        sign: response.data.zodiac_sign || "Unknown",
        element: response.data.element || "Unknown",
        period: `${response.data.start_date || ""} - ${response.data.end_date || ""}`,
        personalityTraits:
          typeof response.data.personality === "string"
            ? response.data.personality.split(". ").filter(t => t.trim())
            : Array.isArray(response.data.personality)
              ? response.data.personality
              : [],
      };
    } catch (error) {
      logger.error(`Error fetching astrology data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Returns mock astrology data for testing
   * @param {Object} params - Request parameters
   * @returns {Object} Mock astrology data
   */
  static getMockAstrologyData(params) {
    // Create basic natal chart data
    const mockData = {
      name: params.name,
      birthdate: params.birthdate,
      birthtime: params.birthtime,
      sun_sign: "Водолей", // For date 1997-02-08
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
}
