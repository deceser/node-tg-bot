import { Markup } from "telegraf";
import logger from "../../utils/logger.js";
import { MESSAGES, COMMANDS } from "../../utils/constants.js";
import { getUserSettings } from "../../data/userSettings.js";

export class ProfileDisplay {
  /**
   * Handles the settings command
   * @param {Object} ctx - Telegraf context
   */
  static async handleSettingsCommand(ctx) {
    const userId = ctx.from.id;
    logger.info("User requested settings", { userId });

    // Get current settings
    const settings = getUserSettings(userId);

    // Format current settings for display
    const currentSettings = [
      `<b>Current settings:</b>`,
      `Name: ${settings.name || "Not set"}`,
      `Birth date: ${settings.birthdate || "Not set"}`,
      `Birth time: ${settings.birthtime || "Not set"}`,
    ].join("\n");

    // Create settings menu
    return ctx.reply(currentSettings, {
      parse_mode: "HTML",
      ...Markup.inlineKeyboard([
        [Markup.button.callback("✏️ Edit Name", "edit_setting:name")],
        [Markup.button.callback("✏️ Edit Birth Date", "edit_setting:birthdate")],
        [Markup.button.callback("✏️ Edit Birth Time", "edit_setting:birthtime")],
        [Markup.button.callback(MESSAGES.BACK_BUTTON, `command:${COMMANDS.MENU}`)],
      ]),
    });
  }

  /**
   * Shows profile settings
   * @param {Object} ctx - Telegraf context
   */
  static async showProfileSettings(ctx) {
    try {
      const userId = ctx.from?.id;
      if (!userId) {
        logger.warn("No user ID in context");
        return;
      }

      const settings = getUserSettings(userId);
      let profileText = "Ваши данные профиля:\n\n";

      if (settings.personalDataSet) {
        profileText += `Имя: ${settings.name || "Не задано"}\n`;
        profileText += `Дата рождения: ${settings.birthdate || "Не задана"}\n`;
        profileText += `Время рождения: ${settings.birthtime || "Не задано"}\n`;
      } else {
        profileText += "Персональные данные не заполнены.";
      }

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback("✏️ Изменить имя", "settings:edit_name")],
        [Markup.button.callback("🗓 Изменить дату рождения", "settings:edit_birthdate")],
        [Markup.button.callback("🕒 Изменить время рождения", "settings:edit_birthtime")],
        [Markup.button.callback(MESSAGES.BACK_BUTTON, "settings:back")],
      ]);

      await ctx.reply(profileText, keyboard);
    } catch (error) {
      logger.error("Error in showProfileSettings:", error);
      await ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.");
    }
  }
}
