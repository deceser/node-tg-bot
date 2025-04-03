import { Markup } from "telegraf";
import { MESSAGES, COMMANDS } from "../utils/constants.js";
import { ApiService } from "./apiService.js";
import logger from "../utils/logger.js";
import { CardService } from "./cardService.js";
import { getUserSettings } from "../data/userSettings.js";

// Object to store form state for each user
const userFormState = new Map();

// Form states
const FORM_STATES = {
  IDLE: "idle",
  WAITING_NAME: "waiting_name",
  WAITING_BIRTHDATE: "waiting_birthdate",
  WAITING_BIRTHTIME: "waiting_birthtime",
  PROCESSING: "processing",
};

export class AstrologyService {
  /**
   * Handles astrology command
   * @param {Object} ctx - Telegraf context
   */
  static async handleAstrologyCommand(ctx) {
    try {
      const userId = ctx.from?.id;
      if (!userId) {
        logger.warn("No user ID in context");
        return;
      }

      logger.info("User requested astrology data", { userId });

      // Reset previous form state if it exists
      userFormState.delete(userId);

      // Send intro and buttons
      await ctx.reply(
        MESSAGES.ASTROLOGY_INTRO,
        Markup.inlineKeyboard([
          [Markup.button.callback(MESSAGES.ASTROLOGY_FORM, "astrology_form")],
          [Markup.button.callback(MESSAGES.TAROT_BUTTON, "tarot_card")],
          [Markup.button.callback(MESSAGES.ASTROLOGY_CANCEL, "astrology_cancel")],
        ])
      );
    } catch (error) {
      logger.error("Error in handleAstrologyCommand:", error);
      try {
        await ctx.reply(MESSAGES.ERROR);
      } catch (replyError) {
        logger.error("Failed to send error message:", replyError);
      }
    }
  }

  /**
   * Handles click on astrology form button
   * @param {Object} ctx - Telegraf context
   */
  static async handleAstrologyForm(ctx) {
    try {
      const userId = ctx.from?.id;
      if (!userId) {
        logger.warn("No user ID in context");
        return;
      }

      // Answer callback query
      try {
        await ctx.answerCbQuery();
      } catch (error) {
        logger.warn("Could not answer callback query", { userId });
      }

      // Initialize empty form
      userFormState.set(userId, {
        state: FORM_STATES.WAITING_NAME,
        data: {},
      });

      // Request name
      await ctx.reply(MESSAGES.ASTROLOGY_NAME_PROMPT);
    } catch (error) {
      logger.error("Error in handleAstrologyForm:", error);
      try {
        await ctx.reply(MESSAGES.ERROR);
      } catch (replyError) {
        logger.error("Failed to send error message:", replyError);
      }
    }
  }

  /**
   * Handles astrology form cancellation
   * @param {Object} ctx - Telegraf context
   */
  static async handleAstrologyCancel(ctx) {
    try {
      const userId = ctx.from?.id;
      if (!userId) {
        logger.warn("No user ID in context");
        return;
      }

      // Answer callback query
      try {
        await ctx.answerCbQuery();
      } catch (error) {
        logger.warn("Could not answer callback query", { userId });
      }

      // Delete user's form data
      userFormState.delete(userId);

      // Send cancellation message
      try {
        await ctx.editMessageText("Data entry cancelled.");
      } catch (error) {
        await ctx.reply("Data entry cancelled.");
      }
    } catch (error) {
      logger.error("Error in handleAstrologyCancel:", error);
    }
  }

  /**
   * Handles text input for astrology form
   * @param {Object} ctx - Telegraf context
   */
  static async handleTextInput(ctx) {
    const userId = ctx.from?.id;
    if (!userId) return;

    // Check if user is filling out the astrology form
    const formData = userFormState.get(userId);
    if (!formData) return;

    try {
      const text = ctx.message.text;
      const currentState = formData.state;

      switch (currentState) {
        case FORM_STATES.WAITING_NAME:
          formData.data.name = text;
          formData.state = FORM_STATES.WAITING_BIRTHDATE;
          await ctx.reply(MESSAGES.ASTROLOGY_BIRTHDATE_PROMPT);
          break;

        case FORM_STATES.WAITING_BIRTHDATE:
          // Validate date format YYYY-MM-DD
          if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
            await ctx.reply("Please enter the date in YYYY-MM-DD format (e.g., 1990-01-31)");
            return;
          }
          formData.data.birthdate = text;
          formData.state = FORM_STATES.WAITING_BIRTHTIME;
          await ctx.reply(MESSAGES.ASTROLOGY_BIRTHTIME_PROMPT);
          break;

        case FORM_STATES.WAITING_BIRTHTIME:
          // Validate time format HH:MM
          if (!/^\d{2}:\d{2}$/.test(text)) {
            await ctx.reply("Please enter the time in HH:MM format (e.g., 15:30)");
            return;
          }
          formData.data.birthtime = text;
          formData.state = FORM_STATES.PROCESSING;

          // Notify about processing start
          await ctx.reply(MESSAGES.ASTROLOGY_PROCESSING);

          try {
            // Send request to API
            const astrologyData = await AstrologyService.getAstrologyData(formData.data);

            // Format data - important to use await since the method is async
            const formattedData = await AstrologyService.formatAstrologyData(astrologyData);

            // Send result
            await ctx.reply(formattedData, { parse_mode: "Markdown" });

            // Add button to return to main menu
            await ctx.reply(
              "Выберите действие:",
              Markup.inlineKeyboard([[Markup.button.callback(MESSAGES.MENU_BUTTON, `command:${COMMANDS.MENU}`)]])
            );
          } catch (dataError) {
            logger.error(`Failed to process astrology data: ${dataError.message}`);
            await ctx.reply(MESSAGES.ASTROLOGY_ERROR);
          }

          // Clear form state
          userFormState.delete(userId);
          break;
      }
    } catch (error) {
      logger.error("Error processing astrology form input:", error);
      await ctx.reply(MESSAGES.ASTROLOGY_ERROR);

      // Reset form state on error
      userFormState.delete(userId);
    }
  }

  /**
   * Gets astrology data from API
   * @param {Object} userData - User data with birthdate and birthtime
   * @returns {Promise<Object>} Astrology data object
   */
  static async getAstrologyData(userData) {
    try {
      logger.info("Getting astrology data");

      // Extract user data
      const { birthdate, birthtime } = userData;

      // Create API request
      const result = await ApiService.getAstrologyData(birthdate, birthtime);

      logger.info("Successfully retrieved astrology data");
      return result;
    } catch (error) {
      logger.error("Error getting astrology data:", error);
      throw error;
    }
  }

  /**
   * Formats astrology data for display
   * @param {Object} data - Raw astrology data
   * @returns {string} Formatted text with markdown
   */
  static formatAstrologyData(data) {
    try {
      if (!data || !data.zodiac) {
        return "Could not get astrology data. Please try again later.";
      }

      // Get zodiac sign and element information
      const zodiacSign = data.zodiac?.name || "Unknown";
      const zodiacSymbol = AstrologyService.getZodiacSymbol(zodiacSign);
      const element = data.element?.name || "Unknown";
      const elementSymbol = AstrologyService.getElementSymbol(element);

      // Get personality characteristics
      const qualities = data.personality?.qualities || [];
      const strengths = data.personality?.strengths || [];
      const weaknesses = data.personality?.weaknesses || [];

      // Format personality text
      let personalityText = "";
      if (qualities.length > 0) {
        personalityText += "Your main characteristics:\n• " + qualities.join("\n• ") + "\n\n";
      }
      if (strengths.length > 0) {
        personalityText += "Your strengths:\n• " + strengths.join("\n• ") + "\n\n";
      }
      if (weaknesses.length > 0) {
        personalityText += "Areas for improvement:\n• " + weaknesses.join("\n• ") + "\n\n";
      }

      // Format period information
      let periodText = "";
      if (data.period && data.period.description) {
        periodText = `*Current period:*\n${data.period.description}\n\n`;
      }

      // Get compatibility information
      const compatibility = data.compatibility || {};
      let compatibilityText = "";
      if (compatibility.best && compatibility.best.length > 0) {
        compatibilityText += `*Best compatibility with:* ${compatibility.best.join(", ")}\n`;
      }
      if (compatibility.worst && compatibility.worst.length > 0) {
        compatibilityText += `*Challenging compatibility with:* ${compatibility.worst.join(", ")}\n`;
      }

      // Format the final text
      const formattedText =
        `${zodiacSymbol} *Your Zodiac Sign: ${zodiacSign}* ${zodiacSymbol}\n` +
        `${elementSymbol} *Element: ${element}*\n\n` +
        `${periodText}` +
        `${personalityText}` +
        `${compatibilityText}`;

      return formattedText;
    } catch (error) {
      logger.error("Error formatting astrology data:", error);
      return "Error processing astrology data.";
    }
  }

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

  /**
   * Handles click on Tarot card button
   * @param {Object} ctx - Telegraf context
   */
  static async handleTarotCard(ctx) {
    try {
      const userId = ctx.from?.id;
      if (!userId) {
        logger.warn("No user ID in context");
        return;
      }

      // Answer callback query
      try {
        await ctx.answerCbQuery(MESSAGES.TAROT_PROCESSING);
      } catch (error) {
        logger.warn("Could not answer callback query", { userId });
      }

      // Notify about processing start
      await ctx.reply(MESSAGES.ASTROLOGY_PROCESSING);

      // Get Tarot card from API
      try {
        const card = await CardService.getSingleCard();
        const formattedCard = await CardService.formatCardData(card);

        if (card.image) {
          // If there's an image for the card, send it with caption
          await ctx.replyWithPhoto(
            { url: card.image },
            {
              caption: formattedCard,
              parse_mode: "Markdown",
            }
          );
        } else {
          // If no image, send text only
          await ctx.reply(formattedCard, { parse_mode: "Markdown" });
        }

        // Add button to return to main menu
        await ctx.reply(
          "Выберите действие:",
          Markup.inlineKeyboard([[Markup.button.callback(MESSAGES.MENU_BUTTON, `command:${COMMANDS.MENU}`)]])
        );
      } catch (error) {
        logger.error(`Error getting tarot card: ${error.message}`);
        await ctx.reply(MESSAGES.TAROT_ERROR);
      }
    } catch (error) {
      logger.error("Error in handleTarotCard:", error);
      try {
        await ctx.reply(MESSAGES.ERROR);
      } catch (replyError) {
        logger.error("Failed to send error message:", replyError);
      }
    }
  }

  /**
   * Обрабатывает запрос на получение гороскопа из меню
   * @param {Object} ctx - Telegraf context
   */
  static async handleAstrologyRequest(ctx) {
    try {
      const userId = ctx.from.id;
      logger.info("User requested astrology data from menu", { userId });

      // Отвечаем на callback query
      try {
        await ctx.answerCbQuery();
      } catch (error) {
        logger.warn("Could not answer callback query", { userId, error: error.message });
      }

      // Получаем настройки пользователя
      const settings = getUserSettings(userId);

      // Проверяем, есть ли у пользователя дата рождения
      if (!settings.birthdate) {
        await ctx.reply(MESSAGES.PERSONAL_DATA_REQUIRED);
        // Показываем кнопку для заполнения данных
        await ctx.reply(
          "Для получения гороскопа необходимо указать дату рождения:",
          Markup.inlineKeyboard([[Markup.button.callback("📝 " + MESSAGES.FILL_PERSONAL_DATA, "fill_personal_data")]])
        );
        return;
      }

      // Уведомляем о начале обработки
      await ctx.reply(MESSAGES.ASTROLOGY_PROCESSING);

      try {
        // Получаем астрологические данные
        const astrologyData = await AstrologyService.getAstrologyData(settings);

        // Форматируем и отправляем результат
        const formattedData = AstrologyService.formatAstrologyData(astrologyData);
        await ctx.reply(formattedData, { parse_mode: "Markdown" });

        // Показываем кнопку возврата в меню
        await ctx.reply(
          "Выберите действие:",
          Markup.inlineKeyboard([[Markup.button.callback(MESSAGES.MENU_BUTTON, `command:${COMMANDS.MENU}`)]])
        );
      } catch (error) {
        logger.error("Error processing astrology data:", error);
        await ctx.reply(MESSAGES.ASTROLOGY_ERROR);

        // Показываем кнопку возврата в меню при ошибке
        await ctx.reply(
          "Вернуться в меню:",
          Markup.inlineKeyboard([[Markup.button.callback(MESSAGES.BACK_BUTTON, `command:${COMMANDS.MENU}`)]])
        );
      }
    } catch (error) {
      logger.error("Error in handleAstrologyRequest:", error);
      await ctx.reply(MESSAGES.ERROR);
    }
  }
}

/**
 * Converts coordinates from DMS format to decimal
 * @param {string} dmsStr - Coordinate string in DMS format (e.g., 47°29'03")
 * @returns {number} Coordinate in decimal format
 */
function convertDMSToDecimal(dmsStr) {
  // Remove all spaces
  dmsStr = dmsStr.replace(/\s+/g, "");

  // Check various coordinate formats
  let degrees = 0,
    minutes = 0,
    seconds = 0;
  let isNegative = false;

  // Check for negative coordinate
  if (dmsStr.startsWith("-")) {
    isNegative = true;
    dmsStr = dmsStr.substring(1);
  } else if (dmsStr.includes("S") || dmsStr.includes("W") || dmsStr.includes("З") || dmsStr.includes("Ю")) {
    isNegative = true;
  }

  // Extract degrees, minutes and seconds
  if (dmsStr.includes("°")) {
    const parts = dmsStr.split("°");
    degrees = parseFloat(parts[0]);
    if (parts[1]) {
      const minuteParts = parts[1].split("'");
      if (minuteParts[0]) {
        minutes = parseFloat(minuteParts[0]);
      }
      if (minuteParts[1]) {
        const secondParts = minuteParts[1].split('"');
        if (secondParts[0]) {
          seconds = parseFloat(secondParts[0]);
        }
      }
    }
  } else {
    // If no special symbols, try to parse as number
    return parseFloat(dmsStr);
  }

  // Convert to decimal format
  let decimal = degrees + minutes / 60 + seconds / 3600;
  return isNegative ? -decimal : decimal;
}
