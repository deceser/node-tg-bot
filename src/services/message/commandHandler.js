import { Markup } from "telegraf";
import logger from "../../utils/logger.js";
import { COMMANDS, MESSAGES } from "../../utils/constants.js";
import { MenuHandler } from "./menuHandler.js";

export class CommandHandler {
  static async handleStart(ctx) {
    const userId = ctx.from.id;
    logger.info("User started the bot", { userId });

    // Immediately show main menu
    return MenuHandler.showMainMenu(ctx);
  }

  static async handleHelp(ctx) {
    logger.info("User requested help", { userId: ctx.from.id });

    await ctx.reply(MESSAGES.HELP);
    return ctx.reply(
      "Press the button to return to the menu:",
      Markup.inlineKeyboard([[Markup.button.callback(MESSAGES.BACK_BUTTON, `command:${COMMANDS.MENU}`)]])
    );
  }

  static async handleCommandButton(ctx) {
    const command = ctx.match[1];
    logger.info("Command button clicked", { command });

    // Answer callback query to remove loading indicator
    await ctx.answerCbQuery().catch(err => logger.warn("Failed to answer callback query", { error: err.message }));

    // Direct command mapping for cleaner routing
    const commandHandlers = {
      [COMMANDS.HELP]: CommandHandler.handleHelp,
      [COMMANDS.SETTINGS]: "SettingsService.handleSettingsCommand",
      [COMMANDS.MENU]: MenuHandler.showMainMenu,
      [COMMANDS.GET_HOROSCOPE]: "ServiceHandler.handleGetHoroscope",
      [COMMANDS.TAROT]: "ServiceHandler.handleTarotCommand",
    };

    const handler = commandHandlers[command];
    if (handler && typeof handler === "function") {
      return handler(ctx);
    }

    return ctx.reply("Unknown command");
  }
}
