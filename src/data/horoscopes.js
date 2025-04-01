import { ZODIAC_SIGNS } from "../utils/constants.js";
import { ApiService } from "../services/apiService.js";
import logger from "../utils/logger.js";
import { getCachedHoroscope, cacheHoroscope } from "./horoscopeCache.js";

// Energy day templates (used as a fallback)
const energyTemplates = [
  "Сегодня вы почувствуете прилив сил и энергии. Отличный день для активных дел.",
  "День может оказаться утомительным. Постарайтесь беречь силы и не перенапрягаться.",
  "Ваша энергия сегодня на среднем уровне. Равномерно распределите нагрузку.",
  "Сегодняшний день наполнит вас жизненной силой. Используйте эту энергию с пользой.",
  "День потребует от вас большой выдержки. Возможна повышенная утомляемость.",
];

// Love and relationships templates (used as a fallback)
const loveTemplates = [
  "В личных отношениях вас ждет гармония и взаимопонимание. Отличный день для романтики.",
  "Возможны небольшие разногласия с партнером. Проявите терпение и понимание.",
  "Одиноких представителей знака может ждать интересное знакомство.",
  "Отличный день для откровенного разговора с близким человеком.",
  "Сегодня стоит уделить больше внимания любимому человеку.",
];

// Finance and career templates (used as a fallback)
const financeTemplates = [
  "Благоприятный день для финансовых операций. Возможны неожиданные денежные поступления.",
  "В рабочих вопросах проявите осторожность. Не самый удачный день для крупных сделок.",
  "Ваша карьера может получить новый импульс. Будьте открыты для предложений.",
  "Финансовое положение стабильно. Хороший день для планирования бюджета.",
  "Возможны профессиональные вызовы. Проявите свои лучшие качества.",
];

// Advice templates (used as a fallback)
const adviceTemplates = [
  "Прислушивайтесь к своей интуиции, она не подведет.",
  "Уделите внимание своему здоровью, особенно питанию.",
  "Не торопитесь с принятием важных решений, все тщательно обдумайте.",
  "Проведите вечер в кругу близких людей, это зарядит вас позитивной энергией.",
  "Займитесь саморазвитием, почитайте интересную книгу или посмотрите познавательный фильм.",
];

/**
 * Generates a random horoscope from local templates for the specified zodiac sign
 * @param {string} zodiacSign - Zodiac sign
 * @returns {Object} Object with horoscope
 */
const generateLocalHoroscope = zodiacSign => {
  logger.info(`Generating local horoscope for ${zodiacSign}`);

  const energy = energyTemplates[Math.floor(Math.random() * energyTemplates.length)];
  const love = loveTemplates[Math.floor(Math.random() * loveTemplates.length)];
  const finance = financeTemplates[Math.floor(Math.random() * financeTemplates.length)];
  const advice = adviceTemplates[Math.floor(Math.random() * adviceTemplates.length)];

  return {
    sign: zodiacSign,
    date: new Date().toISOString().split("T")[0],
    energy,
    love,
    finance,
    advice,
  };
};

/**
 * Generates a horoscope for the specified zodiac sign, using API or local data
 * @param {string} zodiacSign - Zodiac sign
 * @returns {Promise<Object>} Object with horoscope
 */
export const generateHoroscope = async zodiacSign => {
  logger.info(`Generating horoscope for ${zodiacSign}`);

  // Check if the horoscope is in the cache
  const cachedHoroscope = getCachedHoroscope(zodiacSign);
  if (cachedHoroscope) {
    logger.info(`Found cached horoscope for ${zodiacSign}`);
    return cachedHoroscope;
  }

  try {
    // Try to get the horoscope from the API
    const apiHoroscope = await ApiService.getHoroscope(zodiacSign);

    // Check if all required fields are present in the API response
    if (
      !apiHoroscope.description ||
      !apiHoroscope.compatibility ||
      !apiHoroscope.mood ||
      !apiHoroscope.color ||
      !apiHoroscope.lucky_number ||
      !apiHoroscope.lucky_time
    ) {
      logger.warn(`Incomplete API response for ${zodiacSign}, using fallback`);
      const fallbackHoroscope = await getFallbackHoroscope(zodiacSign);
      cacheHoroscope(zodiacSign, fallbackHoroscope);
      return fallbackHoroscope;
    }

    logger.info(`Successfully retrieved API horoscope for ${zodiacSign}`);

    // Form the horoscope object, ensuring all fields are present
    const formattedHoroscope = {
      sign: zodiacSign,
      date: apiHoroscope.current_date || new Date().toISOString().split("T")[0],
      dateRange: apiHoroscope.date_range || ApiService.getZodiacDateRange(zodiacSign),
      description: apiHoroscope.description,
      compatibility: apiHoroscope.compatibility,
      mood: apiHoroscope.mood,
      color: apiHoroscope.color,
      luckyNumber: apiHoroscope.lucky_number,
      luckyTime: apiHoroscope.lucky_time,
      // Дополнительно добавляем данные для сохранения совместимости
      energy: `Энергетика дня: ${apiHoroscope.mood}. ${apiHoroscope.description.split(".")[0]}.`,
      love: `Совместимость сегодня: ${apiHoroscope.compatibility}. Это хороший день для отношений.`,
      finance: `Удачное число: ${apiHoroscope.lucky_number}. Благоприятное время для финансов: ${apiHoroscope.lucky_time}.`,
      advice:
        apiHoroscope.description.split(".").slice(1).join(".").trim() || "Прислушивайтесь к себе и своим желаниям.",
    };

    // Save to cache
    cacheHoroscope(zodiacSign, formattedHoroscope);

    return formattedHoroscope;
  } catch (error) {
    // Write the error and use the fallback
    logger.error(`Error fetching horoscope from API for ${zodiacSign}: ${error.message}`);
    const fallbackHoroscope = await getFallbackHoroscope(zodiacSign);
    cacheHoroscope(zodiacSign, fallbackHoroscope);
    return fallbackHoroscope;
  }
};

/**
 * Gets a fallback horoscope when the API is unavailable
 * @param {string} zodiacSign - Zodiac sign
 * @returns {Promise<Object>} Object with horoscope
 */
const getFallbackHoroscope = async zodiacSign => {
  try {
    // First try to get the horoscope from the fallback API
    const fallbackHoroscope = await ApiService.getFallbackHoroscope(zodiacSign);
    return fallbackHoroscope;
  } catch (fallbackError) {
    // In case of an error and in the fallback API, use local templates
    logger.error(`Error in fallback API, using local templates: ${fallbackError.message}`);
    return generateLocalHoroscope(zodiacSign);
  }
};

/**
 * Formats the horoscope for sending to the user
 * @param {Object} horoscope - Horoscope object
 * @returns {string} Formatted horoscope text
 */
export const formatHoroscope = horoscope => {
  // Check if the key fields are present and set default values
  const sign = horoscope.sign || "вашего знака";
  const date = horoscope.date || new Date().toISOString().split("T")[0];
  const dateRange = horoscope.dateRange || "Текущий день";

  // Check if this is an extended horoscope from the API or local
  if (horoscope.description) {
    // Formatting for API-horoscope with check for undefined
    return (
      `🌟 *Гороскоп для ${sign} на ${date}* 🌟\n\n` +
      `📅 *Период:* ${dateRange}\n\n` +
      `✨ *Общее описание:*\n${horoscope.description || "Информация недоступна"}\n\n` +
      `❤️ *Совместимость:* ${horoscope.compatibility || "Все знаки"}\n` +
      `😊 *Настроение:* ${horoscope.mood || "Нейтральное"}\n` +
      `🎨 *Счастливый цвет:* ${horoscope.color || "Радуга"}\n` +
      `🔢 *Счастливое число:* ${horoscope.luckyNumber || "7"}\n` +
      `⏰ *Счастливое время:* ${horoscope.luckyTime || "Любое"}\n\n` +
      `⚡ *Совет дня:*\n${horoscope.advice || "Прислушивайтесь к себе и своим желаниям"}`
    );
  } else {
    // Formatting for local horoscope with check for undefined
    return (
      `🌟 *Гороскоп для ${sign} на ${date}* 🌟\n\n` +
      `🔥 *Энергия дня:*\n${horoscope.energy || "День будет наполнен энергией"}\n\n` +
      `💖 *Любовь и отношения:*\n${horoscope.love || "Благоприятный день для отношений"}\n\n` +
      `💰 *Финансы и карьера:*\n${horoscope.finance || "Стабильный день для финансов"}\n\n` +
      `⚡ *Совет дня:*\n${horoscope.advice || "Прислушивайтесь к интуиции"}`
    );
  }
};
