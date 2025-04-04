export class ZodiacUtils {
  /**
   * Gets symbol for zodiac sign
   * @param {string} sign - Zodiac sign name
   * @returns {string} Emoji symbol
   */
  static getZodiacSymbol(sign) {
    const symbols = {
      Aries: "♈",
      Taurus: "♉",
      Gemini: "♊",
      Cancer: "♋",
      Leo: "♌",
      Virgo: "♍",
      Libra: "♎",
      Scorpio: "♏",
      Sagittarius: "♐",
      Capricorn: "♑",
      Aquarius: "♒",
      Pisces: "♓",
    };

    return symbols[sign] || "✨";
  }

  /**
   * Gets symbol for element
   * @param {string} element - Element name
   * @returns {string} Emoji symbol
   */
  static getElementSymbol(element) {
    const symbols = {
      Fire: "🔥",
      Earth: "🌍",
      Air: "💨",
      Water: "💧",
    };

    return symbols[element] || "✨";
  }
}
