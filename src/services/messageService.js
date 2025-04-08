import { MenuHandler } from "./message/menuHandler.js";
import { CommandHandler } from "./message/commandHandler.js";
import { TextHandler } from "./message/textHandler.js";
import { PersonalDataHandler } from "./message/personalDataHandler.js";
import { ServiceHandler } from "./message/serviceHandler.js";
import { withErrorHandling } from "./message/errorHandler.js";

import { SettingsService } from "./settingsService.js";
import { AstrologyService } from "./astrologyService.js";
import { CardService } from "./cardService.js";
import logger from "../utils/logger.js";
import { COMMANDS, MESSAGES } from "../utils/constants.js";

export class MessageService {
  // Command Handlers
  static handleStart = CommandHandler.handleStart;
  static handleHelp = CommandHandler.handleHelp;

  // Переопределяем метод handleCommandButton для корректной обработки команд
  static handleCommandButton = async ctx => {
    const command = ctx.match[1];
    logger.info("Command button clicked", { command });

    // Answer callback query to remove loading indicator
    await ctx.answerCbQuery().catch(err => logger.warn("Failed to answer callback query", { error: err.message }));

    // Direct command mapping for cleaner routing
    const commandHandlers = {
      [COMMANDS.HELP]: CommandHandler.handleHelp,
      [COMMANDS.SETTINGS]: SettingsService.handleSettingsCommand,
      [COMMANDS.MENU]: MenuHandler.showMainMenu,
      [COMMANDS.GET_HOROSCOPE]: MessageService.handleGetHoroscope,
      [COMMANDS.TAROT]: MessageService.handleTarotCommand,
    };

    const handler = commandHandlers[command];
    if (handler) {
      return handler(ctx);
    }

    return ctx.reply("Unknown command");
  };

  // Menu Handlers
  static showMainMenu = MenuHandler.showMainMenu;

  // Text Handlers
  static handleText = ctx => {
    // Вызываем обработчик текста, который возвращает строку или результат
    return TextHandler.handleText(ctx).then(result => {
      // Если результат - строка, обрабатываем её соответствующей функцией
      if (result === "SettingsService.handleProfileEdit") {
        return SettingsService.handleProfileEdit(ctx);
      } else if (result === "PersonalDataHandler.handlePersonalDataInput") {
        return PersonalDataHandler.handlePersonalDataInput(ctx);
      } else if (result === "AstrologyService.handleAstrologyRequest") {
        return AstrologyService.handleAstrologyRequest(ctx);
      } else if (result === "SettingsService.handleSettingsCommand") {
        return SettingsService.handleSettingsCommand(ctx);
      } else if (result === "CommandHandler.handleHelp") {
        return CommandHandler.handleHelp(ctx);
      } else if (result === "ServiceHandler.handleTarotCommand") {
        return MessageService.handleTarotCommand(ctx);
      }
      // Если это не строка, возвращаем результат как есть
      return result;
    });
  };

  // Personal Data Handlers
  static handlePersonalDataInput = PersonalDataHandler.handlePersonalDataInput;
  static handleFillPersonalData = PersonalDataHandler.handleFillPersonalData;

  // Service Handlers
  static handleGetHoroscope = ctx => {
    return AstrologyService.handleAstrologyRequest(ctx);
  };

  static handleTarotCommand = async ctx => {
    const userId = ctx.from.id;
    logger.info("User requested tarot card", { userId });

    // Сначала проверяем доступность карты через ServiceHandler
    const availability = await ServiceHandler.handleTarotCommand(ctx);
    if (typeof availability === "string") {
      // Обрабатываем новый формат ответа
      const [messageType, buttonsEnabled] = availability.split(":");

      if (messageType === "CARD_LIMIT_REACHED") {
        // Если карта недоступна, показываем сообщение
        return ctx.reply(MESSAGES.CARD_LIMIT_REACHED, CardService.getCardButtons(buttonsEnabled === "true"));
      } else if (messageType === "CARD_INTRO") {
        // Если карта доступна, вместо показа интро сразу рисуем карту
        return CardService.handleDrawCard(ctx);
      }
    }

    return availability;
  };
}

// Apply error handling to all public methods
Object.getOwnPropertyNames(MessageService)
  .filter(prop => typeof MessageService[prop] === "function" && !prop.startsWith("_"))
  .forEach(methodName => {
    const originalMethod = MessageService[methodName];
    MessageService[methodName] = withErrorHandling(originalMethod);
  });
