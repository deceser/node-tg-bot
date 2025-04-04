import { Markup } from "telegraf";
import logger from "../../utils/logger.js";
import { MESSAGES, COMMANDS } from "../../utils/constants.js";
import { ApiService } from "../apiService.js";
import { getUserSettings } from "../../data/userSettings.js";

// Import userFormState directly to avoid circular dependency
// This is declared in astrologyFormHandler.js
export const userFormState = new Map();

export class AstrologyCommandHandler {
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
   * Handle astrology data request from user
   * @param {Object} ctx - Telegraf context
   */
  static async handleAstrologyRequest(ctx) {
    const userId = ctx.from.id;
    logger.info("User requested astrology data", { userId });

    const settings = getUserSettings(userId);

    // Check if user has set their personal data
    if (!settings.personalDataSet) {
      return ctx.reply(
        MESSAGES.NO_PERSONAL_DATA,
        Markup.inlineKeyboard([
          [Markup.button.callback(MESSAGES.FILL_DATA_BUTTON, "fill_personal_data")],
          [Markup.button.callback(MESSAGES.BACK_BUTTON, `command:${COMMANDS.MENU}`)],
        ])
      );
    }

    await ctx.reply(MESSAGES.ASTROLOGY_PROCESSING);

    try {
      const astrologyData = await AstrologyCommandHandler._fetchAstrologyData(userId, settings);
      return await AstrologyCommandHandler._sendHoroscopeResponse(ctx, astrologyData);
    } catch (error) {
      logger.error("Error getting astrology data:", { userId, error: error.message });
      return ctx.reply(
        MESSAGES.ASTROLOGY_ERROR,
        Markup.inlineKeyboard([[Markup.button.callback(MESSAGES.BACK_BUTTON, `command:${COMMANDS.MENU}`)]])
      );
    }
  }

  /**
   * Fetch astrology data for a user
   * @private
   */
  static async _fetchAstrologyData(userId, userSettings) {
    if (!userSettings.birthdate) {
      throw new Error("Missing birthdate in user settings");
    }

    return await ApiService.getAstrologyData(userSettings.name, userSettings.birthdate, userSettings.birthtime);
  }

  /**
   * Send formatted horoscope response to user
   * @private
   */
  static async _sendHoroscopeResponse(ctx, data) {
    if (!data || !data.sign) {
      throw new Error("Invalid astrology data received");
    }

    const userId = ctx.from.id;
    const userSettings = getUserSettings(userId);

    // Format the response message with user information
    const responseMessage = [
      `<b>🌟 Астрологический отчет 🌟</b>`,
      ``,
      `<b>👤 Имя:</b> ${userSettings.name || ctx.from.first_name}`,
      `<b>📅 Дата рождения:</b> ${userSettings.birthdate || "Не указана"}`,
      `<b>⏰ Время рождения:</b> ${userSettings.birthtime || "Не указано"}`,
      ``,
      `<b>♒️ Знак зодиака:</b> ${data.sign}`,
      `<b>🌪️ Стихия:</b> ${data.element}`,
      ``,
      `<b>🔮 Персональная характеристика:</b>`,
      data.personalityTraits.join(" "),
    ].join("\n");

    return ctx.reply(responseMessage, {
      parse_mode: "HTML",
      ...Markup.inlineKeyboard([[Markup.button.callback(MESSAGES.BACK_BUTTON, `command:${COMMANDS.MENU}`)]]),
    });
  }
}
