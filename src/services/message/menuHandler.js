import { Markup } from "telegraf";
import logger from "../../utils/logger.js";
import { COMMANDS, MESSAGES } from "../../utils/constants.js";
import { getUserSettings } from "../../data/userSettings.js";

export class MenuHandler {
  /**
   * Shows the bot's main menu
   * @param {Object} ctx - Telegraf context
   */
  static async showMainMenu(ctx) {
    const userId = ctx.from.id;
    const settings = getUserSettings(userId);
    const name = settings.name || ctx.from.first_name;

    // Create menu buttons
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback("🔮 " + MESSAGES.GET_HOROSCOPE, "get_astrology")],
      [Markup.button.callback("🎴 " + MESSAGES.TAROT_BUTTON, `command:${COMMANDS.TAROT}`)],
      [Markup.button.callback("⚙️ Настройки", `command:${COMMANDS.SETTINGS}`)],
      [Markup.button.callback("❓ Помощь", `command:${COMMANDS.HELP}`)],
    ]);

    const menuText = `Привет, ${name}!\nВыберите интересующую вас функцию:`;
    return ctx.reply(menuText, keyboard);
  }
}
