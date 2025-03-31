import logger from "../utils/logger.js";
import { Markup } from "telegraf";
import { COMMANDS, MESSAGES } from "../utils/constants.js";

export class MessageService {
  static async handleStart(ctx) {
    try {
      const { first_name } = ctx.from;
      logger.info("User started the bot", { userId: ctx.from.id });

      // Create a keyboard with main function buttons
      const keyboard = Markup.inlineKeyboard([
        [
          Markup.button.callback("🔮 Гороскоп", `command:${COMMANDS.HOROSCOPE}`),
          Markup.button.callback("🎴 Карта дня", `command:${COMMANDS.CARD}`),
        ],
        [
          Markup.button.callback("⚙️ Настройки", `command:${COMMANDS.SETTINGS}`),
          Markup.button.callback("❓ Помощь", `command:${COMMANDS.HELP}`),
        ],
      ]);

      const greeting = `Привет, ${first_name}! ${MESSAGES.START}`;
      await ctx.reply(greeting, keyboard);
    } catch (error) {
      logger.error("Error in handleStart:", error);
      await ctx.reply(MESSAGES.ERROR);
    }
  }

  static async handleHelp(ctx) {
    try {
      logger.info("User requested help", { userId: ctx.from.id });
      await ctx.reply(MESSAGES.HELP);
    } catch (error) {
      logger.error("Error in handleHelp:", error);
      await ctx.reply(MESSAGES.ERROR);
    }
  }

  static async handleText(ctx) {
    try {
      const { text } = ctx.message;
      logger.info("Received message", {
        userId: ctx.from.id,
        message: text,
      });

      const { HoroscopeService } = await import("../services/horoscopeService.js");
      const { CardService } = await import("../services/cardService.js");
      const { SettingsService } = await import("../services/settingsService.js");

      // Check for commands written as text
      if (text.toLowerCase().includes("гороскоп")) {
        return HoroscopeService.handleHoroscopeCommand(ctx);
      } else if (text.toLowerCase().includes("карт")) {
        return CardService.handleCardCommand(ctx);
      } else if (text.toLowerCase().includes("настройк")) {
        return SettingsService.handleSettingsCommand(ctx);
      } else if (text.toLowerCase().includes("помощь") || text.toLowerCase().includes("помоги")) {
        return MessageService.handleHelp(ctx);
      }

      await ctx.reply(`Я не совсем понимаю, что вы имеете в виду. Используйте команды бота для взаимодействия.`);
    } catch (error) {
      logger.error("Error in handleText:", error);
      await ctx.reply(MESSAGES.ERROR);
    }
  }

  /**
   * Handles command button clicks
   * @param {Object} ctx - Telegraf context
   */
  static async handleCommandButton(ctx) {
    try {
      const command = ctx.match[1];
      logger.info("User clicked command button", { userId: ctx.from.id, command });

      const { HoroscopeService } = await import("../services/horoscopeService.js");
      const { CardService } = await import("../services/cardService.js");
      const { SettingsService } = await import("../services/settingsService.js");

      // Emulate command execution
      await ctx.deleteMessage();

      switch (command) {
        case COMMANDS.HOROSCOPE:
          return HoroscopeService.handleHoroscopeCommand(ctx);
        case COMMANDS.CARD:
          return CardService.handleCardCommand(ctx);
        case COMMANDS.SETTINGS:
          return SettingsService.handleSettingsCommand(ctx);
        case COMMANDS.HELP:
          return MessageService.handleHelp(ctx);
        default:
          logger.warn("Unknown command button clicked", { command });
          return ctx.reply(MESSAGES.ERROR);
      }
    } catch (error) {
      logger.error("Error in handleCommandButton:", error);
      await ctx.reply(MESSAGES.ERROR);
    }
  }
}
