/**
 * Utilities for zodiac sign operations
 */
export class ZodiacUtils {
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
