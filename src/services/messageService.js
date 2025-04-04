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
    const textHandler = new TextHandler();
    const handleTextTemp = TextHandler.handleText;

    // Заменяем строки на реальные функции в обработчике текста
    return handleTextTemp(ctx).then(result => {
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
        return ServiceHandler.handleTarotCommand(ctx);
      }
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

  static handleTarotCommand = ctx => {
    // Заменяем строку на реальную функцию в ServiceHandler
    const handleTarotTemp = ServiceHandler.handleTarotCommand;

    return handleTarotTemp(ctx).then(result => {
      if (typeof result === "string") {
        // Обрабатываем новый формат ответа
        const [messageType, buttonsEnabled] = result.split(":");

        if (messageType === "CARD_LIMIT_REACHED") {
          return ctx.reply(MESSAGES.CARD_LIMIT_REACHED, CardService.getCardButtons(buttonsEnabled === "true"));
        } else if (messageType === "CARD_INTRO") {
          return ctx.reply(MESSAGES.CARD_INTRO, CardService.getCardButtons(buttonsEnabled === "true"));
        }
      }
      return result;
    });
  };
}

// Apply error handling to all public methods
Object.getOwnPropertyNames(MessageService)
  .filter(prop => typeof MessageService[prop] === "function" && !prop.startsWith("_"))
  .forEach(methodName => {
    const originalMethod = MessageService[methodName];
    MessageService[methodName] = withErrorHandling(originalMethod);
  });
