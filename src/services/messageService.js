import logger from "../utils/logger.js";
import { Markup } from "telegraf";
import { COMMANDS, MESSAGES } from "../utils/constants.js";
import { getUserSettings, saveUserSettings } from "../data/userSettings.js";
import { AstrologyService } from "./astrologyService.js";
import { SettingsService } from "./settingsService.js";

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

export class MessageService {
  static async handleStart(ctx) {
    try {
      const userId = ctx.from.id;
      logger.info("User started the bot", { userId });

      const settings = getUserSettings(userId);

      // Show main menu
      await MessageService.showMainMenu(ctx);
    } catch (error) {
      logger.error("Error in handleStart:", error);
      await ctx.reply(MESSAGES.ERROR);
    }
  }

  static async handleHelp(ctx) {
    try {
      logger.info("User requested help", { userId: ctx.from.id });
      await ctx.reply(MESSAGES.HELP);
      await ctx.reply(
        "Press the button to return to the menu:",
        Markup.inlineKeyboard([[Markup.button.callback(MESSAGES.BACK_BUTTON, `command:${COMMANDS.MENU}`)]])
      );
    } catch (error) {
      logger.error("Error in handleHelp:", error);
      await ctx.reply(MESSAGES.ERROR);
    }
  }

  /**
   * Shows the bot's main menu
   * @param {Object} ctx - Telegraf context
   */
  static async showMainMenu(ctx) {
    try {
      const userId = ctx.from.id;
      const settings = getUserSettings(userId);
      const { first_name } = ctx.from;

      // Создаем кнопки меню
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback("🔮 " + MESSAGES.GET_HOROSCOPE, "get_astrology")],
        [Markup.button.callback("🎴 " + MESSAGES.TAROT_BUTTON, `command:${COMMANDS.TAROT}`)],
        [Markup.button.callback("⚙️ Настройки", `command:${COMMANDS.SETTINGS}`)],
        [Markup.button.callback("❓ Помощь", `command:${COMMANDS.HELP}`)],
      ]);

      let menuText = `Привет, ${first_name}!`;
      if (settings.name) {
        menuText = `Привет, ${settings.name}!`;
      }

      menuText += "\nВыберите интересующую вас функцию:";

      await ctx.reply(menuText, keyboard);
    } catch (error) {
      logger.error("Error in showMainMenu:", error);
      await ctx.reply(MESSAGES.ERROR);
    }
  }

  static async handleText(ctx) {
    try {
      const { text } = ctx.message;
      const userId = ctx.from.id;
      logger.info("Received message", {
        userId,
        message: text,
      });

      // Check if the user is editing their profile
      if (await SettingsService.handleProfileEdit(ctx)) {
        return;
      }

      // Check if the user is filling personal data form
      const formData = userFormState.get(userId);
      if (formData) {
        return await MessageService.handlePersonalDataInput(ctx);
      }

      // Process text commands
      if (text.toLowerCase().includes("меню")) {
        return await MessageService.showMainMenu(ctx);
      } else if (text.toLowerCase().includes("гороскоп")) {
        return await AstrologyService.handleAstrologyRequest(ctx);
      } else if (text.toLowerCase().includes("настройк")) {
        return await SettingsService.handleSettingsCommand(ctx);
      } else if (text.toLowerCase().includes("помощь") || text.toLowerCase().includes("помоги")) {
        return await MessageService.handleHelp(ctx);
      } else if (text.toLowerCase().includes("таро") || text.toLowerCase().includes("карт")) {
        return await MessageService.handleTarotCommand(ctx);
      }

      await ctx.reply(`Я не совсем понимаю, что вы имеете в виду. Используйте кнопки меню для взаимодействия.`);
      await MessageService.showMainMenu(ctx);
    } catch (error) {
      logger.error("Error in handleText:", error);
      await ctx.reply(MESSAGES.ERROR);
    }
  }

  /**
   * Handles personal data input from user
   * @param {Object} ctx - Telegraf context
   */
  static async handlePersonalDataInput(ctx) {
    const userId = ctx.from.id;
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
            await ctx.reply("Введите дату в формате ГГГГ-ММ-ДД (например, 1990-01-31)");
            return;
          }
          formData.data.birthdate = text;
          formData.state = FORM_STATES.WAITING_BIRTHTIME;
          await ctx.reply(MESSAGES.ASTROLOGY_BIRTHTIME_PROMPT);
          break;

        case FORM_STATES.WAITING_BIRTHTIME:
          // Validate time format HH:MM
          if (!/^\d{2}:\d{2}$/.test(text)) {
            await ctx.reply("Введите время в формате ЧЧ:ММ (например, 15:30)");
            return;
          }
          formData.data.birthtime = text;
          formData.state = FORM_STATES.PROCESSING;

          // Save user data
          saveUserSettings(userId, {
            name: formData.data.name,
            birthdate: formData.data.birthdate,
            birthtime: formData.data.birthtime,
            personalDataSet: true,
          });

          // Clear form state
          userFormState.delete(userId);

          await ctx.reply(MESSAGES.PERSONAL_DATA_SAVED);
          await MessageService.showMainMenu(ctx);
          break;
      }
    } catch (error) {
      logger.error("Error processing personal data input:", error);
      await ctx.reply(MESSAGES.ERROR);

      // Reset form state on error
      userFormState.delete(userId);
    }
  }

  /**
   * Handles horoscope request
   * @param {Object} ctx - Telegraf context
   */
  static async handleGetHoroscope(ctx) {
    try {
      // Перенаправляем запрос на новый обработчик AstrologyService
      await AstrologyService.handleAstrologyRequest(ctx);
    } catch (error) {
      logger.error("Error in handleGetHoroscope:", error);
      await ctx.reply(MESSAGES.ASTROLOGY_ERROR);
    }
  }

  /**
   * Handles button click or command for Tarot card
   * @param {Object} ctx - Telegraf context
   */
  static async handleTarotCommand(ctx) {
    try {
      const userId = ctx.from.id;
      logger.info("User requested tarot card", { userId });

      // Pass request to handler in AstrologyService
      await AstrologyService.handleTarotCard(ctx);
    } catch (error) {
      logger.error("Error in handleTarotCommand:", error);
      await ctx.reply(MESSAGES.ERROR);
    }
  }

  static async handleCommandButton(ctx) {
    try {
      const command = ctx.match[1];
      logger.info("Command button clicked", { command });

      // Answer callback query
      await ctx.answerCbQuery();

      switch (command) {
        case COMMANDS.HELP:
          return await MessageService.handleHelp(ctx);
        case COMMANDS.SETTINGS:
          return await SettingsService.handleSettingsCommand(ctx);
        case COMMANDS.MENU:
          return await MessageService.showMainMenu(ctx);
        case COMMANDS.GET_HOROSCOPE:
          return await MessageService.handleGetHoroscope(ctx);
        case COMMANDS.TAROT:
          return await MessageService.handleTarotCommand(ctx);
        default:
          await ctx.reply("Unknown command");
      }
    } catch (error) {
      logger.error("Error handling command button", error);
      await ctx.reply(MESSAGES.ERROR);
    }
  }

  /**
   * Starts the process of filling personal data
   * @param {Object} ctx - Telegraf context
   */
  static async handleFillPersonalData(ctx) {
    try {
      const userId = ctx.from.id;

      // Start personal data filling process
      userFormState.set(userId, {
        state: FORM_STATES.WAITING_NAME,
        data: {},
      });

      await ctx.reply(MESSAGES.START);
      await ctx.reply(MESSAGES.ASTROLOGY_NAME_PROMPT);
    } catch (error) {
      logger.error("Error in handleFillPersonalData:", error);
      await ctx.reply(MESSAGES.ERROR);
    }
  }
}
