import { Markup } from "telegraf";
import { getUserSettings, saveUserSettings } from "../data/userSettings.js";
import { ZODIAC_SIGNS } from "../utils/constants.js";
import logger from "../utils/logger.js";

export class SettingsService {
  /**
   * Handles the settings command
   * @param {Object} ctx - Telegraf context
   */
  static async handleSettingsCommand(ctx) {
    try {
      const userId = ctx.from?.id;
      if (!userId) {
        logger.warn("No user ID in context");
        return;
      }

      logger.info("User requested settings", { userId });

      const settings = getUserSettings(userId);
      const zodiacSign = settings.zodiacSign || "Не выбран";
      const autoHoroscope = settings.autoHoroscope ? "Включена" : "Выключена";

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback(`Знак зодиака: ${zodiacSign}`, "settings:zodiac")],
        [Markup.button.callback(`Автоотправка гороскопа: ${autoHoroscope}`, "settings:auto_horoscope")],
      ]);

      await ctx.reply("Ваши текущие настройки:", keyboard);
    } catch (error) {
      logger.error("Error in handleSettingsCommand:", error);
      try {
        await ctx.reply("Произошла ошибка при загрузке настроек. Пожалуйста, попробуйте позже.");
      } catch (replyError) {
        logger.error("Failed to send error message:", replyError);
      }
    }
  }

  /**
   * Handles the selection of a settings section
   * @param {Object} ctx - Telegraf context
   * @param {string} section - Settings section
   */
  static async handleSettingsSection(ctx, section) {
    try {
      const userId = ctx.from?.id;
      if (!userId) {
        logger.warn("No user ID in context");
        return;
      }

      logger.info("User selected settings section", { section, userId });

      switch (section) {
        case "zodiac":
          await SettingsService.showZodiacSettings(ctx);
          break;
        case "auto_horoscope":
          await SettingsService.toggleAutoHoroscope(ctx);
          break;
        case "back":
          await SettingsService.handleSettingsCommand(ctx);
          break;
        default:
          await ctx.reply("Неизвестный раздел настроек");
      }
    } catch (error) {
      logger.error("Error in handleSettingsSection:", error);
      try {
        await ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.");
      } catch (replyError) {
        logger.error("Failed to send error message:", replyError);
      }
    }
  }

  /**
   * Shows the zodiac sign selection settings
   * @param {Object} ctx - Telegraf context
   */
  static async showZodiacSettings(ctx) {
    try {
      const buttons = Object.values(ZODIAC_SIGNS).map(sign => ({
        text: sign,
        callback_data: `settings_zodiac:${sign}`,
      }));

      // Split buttons into rows of 3 buttons each
      const keyboard = [];
      for (let i = 0; i < buttons.length; i += 3) {
        keyboard.push(buttons.slice(i, i + 3));
      }

      // Add the "Back" button
      keyboard.push([{ text: "« Назад", callback_data: "settings:back" }]);

      try {
        await ctx.editMessageText("Выберите ваш знак зодиака:", Markup.inlineKeyboard(keyboard));
      } catch (editError) {
        // If it's not possible to edit the message, send a new one
        logger.warn("Could not edit message, sending new", { error: editError.message });
        await ctx.reply("Выберите ваш знак зодиака:", Markup.inlineKeyboard(keyboard));
      }
    } catch (error) {
      logger.error("Error in showZodiacSettings:", error);
      try {
        await ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.");
      } catch (replyError) {
        logger.error("Failed to send error message:", replyError);
      }
    }
  }

  /**
   * Handles the selection of a zodiac sign in settings
   * @param {Object} ctx - Telegraf context
   * @param {string} sign - Selected zodiac sign
   */
  static async handleZodiacSelection(ctx, sign) {
    try {
      const userId = ctx.from?.id;
      if (!userId) {
        logger.warn("No user ID in context");
        return;
      }

      logger.info("User selected zodiac sign", { userId, sign });

      // Save the selected zodiac sign
      saveUserSettings(userId, { zodiacSign: sign });

      try {
        await ctx.answerCbQuery(`Знак зодиака установлен: ${sign}`);
      } catch (cbError) {
        logger.warn("Could not answer callback query", { error: cbError.message });
      }

      // Show the updated settings
      return SettingsService.handleSettingsCommand(ctx);
    } catch (error) {
      logger.error("Error in handleZodiacSelection:", error);
      try {
        await ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.");
      } catch (replyError) {
        logger.error("Failed to send error message:", replyError);
      }
    }
  }

  /**
   * Toggles the auto horoscope sending setting
   * @param {Object} ctx - Telegraf context
   */
  static async toggleAutoHoroscope(ctx) {
    try {
      const userId = ctx.from?.id;
      if (!userId) {
        logger.warn("No user ID in context");
        return;
      }

      const settings = getUserSettings(userId);

      // Toggle the setting
      const newAutoStatus = !settings.autoHoroscope;
      saveUserSettings(userId, { autoHoroscope: newAutoStatus });

      logger.info("User toggled auto horoscope", { userId, enabled: newAutoStatus });

      try {
        await ctx.answerCbQuery();
      } catch (cbError) {
        logger.warn("Could not answer callback query", { error: cbError.message });
      }

      try {
        await ctx.editMessageText(
          "Ваши текущие настройки:",
          Markup.inlineKeyboard([
            [Markup.button.callback(`Знак зодиака: ${settings.zodiacSign || "Не выбран"}`, "settings:zodiac")],
            [
              Markup.button.callback(
                `Автоотправка гороскопа: ${newAutoStatus ? "Включена" : "Выключена"}`,
                "settings:auto_horoscope"
              ),
            ],
          ])
        );
      } catch (editError) {
        // If it's not possible to edit the message, send a new one
        await ctx.reply(`Автоотправка гороскопа ${newAutoStatus ? "включена" : "выключена"}`);
        return SettingsService.handleSettingsCommand(ctx);
      }
    } catch (error) {
      logger.error("Error in toggleAutoHoroscope:", error);
      try {
        await ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.");
      } catch (replyError) {
        logger.error("Failed to send error message:", replyError);
      }
    }
  }
}
