import logger from "../../utils/logger.js";
import { userFormState } from "./formState.js";
import { MenuHandler } from "./menuHandler.js";

export class TextHandler {
  static async handleText(ctx) {
    const { text } = ctx.message;
    const userId = ctx.from.id;

    logger.info("Received message", { userId, message: text });

    // Эти обработчики будут заменены в index.js
    const settingsHandlerFn = "SettingsService.handleProfileEdit";
    const personalDataHandlerFn = "PersonalDataHandler.handlePersonalDataInput";
    const astrologyHandlerFn = "AstrologyService.handleAstrologyRequest";
    const settingsCommandFn = "SettingsService.handleSettingsCommand";
    const helpHandlerFn = "CommandHandler.handleHelp";
    const tarotCommandFn = "ServiceHandler.handleTarotCommand";

    // Early returns for specialized handlers
    if (await settingsHandlerFn(ctx)) {
      return;
    }

    const formData = userFormState.get(userId);
    if (formData) {
      return personalDataHandlerFn(ctx);
    }

    // Text command matching with early returns
    const textLower = text.toLowerCase();
    if (textLower.includes("меню")) {
      return MenuHandler.showMainMenu(ctx);
    }

    if (textLower.includes("гороскоп")) {
      return astrologyHandlerFn(ctx);
    }

    if (textLower.includes("настройк")) {
      return settingsCommandFn(ctx);
    }

    if (textLower.includes("помощь") || textLower.includes("помоги")) {
      return helpHandlerFn(ctx);
    }

    if (textLower.includes("таро") || textLower.includes("карт")) {
      return tarotCommandFn(ctx);
    }

    // Default fallback - show menu with a note
    await ctx.reply(`Я не совсем понимаю, что вы имеете в виду. Используйте кнопки меню для взаимодействия.`);
    return MenuHandler.showMainMenu(ctx);
  }
}
