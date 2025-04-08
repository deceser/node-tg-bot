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

    // Create menu buttons as a keyboard with 2 columns
    // const keyboard = Markup.keyboard([
    //   ["🔮 " + MESSAGES.GET_HOROSCOPE, "🎴 " + MESSAGES.TAROT_BUTTON],
    //   ["⚙️ Настройки", "❓ Помощь"],
    // ])
    //   .resize() // Установка resize_keyboard=true для лучшего отображения на мобильных устройствах
    //   .persistent(); // Установка one_time_keyboard=false, чтобы клавиатура не исчезала

    // const menuText = `Привет, ${name}!\nВыберите интересующую вас функцию:`;

    // try {
    //   return await ctx.reply(menuText, keyboard);
    // } catch (error) {
    //   logger.error("Ошибка при отображении меню:", error);
    //   return ctx.reply("Произошла ошибка при отображении меню. Пожалуйста, попробуйте еще раз.");
    // }
  }
}
