import { MessageService } from "../services/messageService.js";
import { SettingsService } from "../services/settingsService.js";
import { CardService } from "../services/cardService.js";
import logger from "../utils/logger.js";

/**
 * Registers all bot commands and action handlers
 * @param {Telegraf} bot - Telegraf bot instance
 */
export const setupCommands = bot => {
  try {
    logger.info("Setting up bot commands and handlers");

    // Group command handlers by service type
    const commandHandlers = {
      // Basic commands
      basic: [
        { command: "start", handler: MessageService.handleStart },
        { command: "help", handler: MessageService.handleHelp },
        {
          pattern: /command:(.+)/,
          handler: MessageService.handleCommandButton,
        },
      ],

      // Feature-specific commands
      features: [
        {
          pattern: "get_astrology",
          handler: MessageService.handleGetHoroscope,
        },
        {
          pattern: "draw_card",
          handler: CardService.handleDrawCard,
        },
      ],

      // Settings and profile handlers
      settings: [
        {
          pattern: "fill_personal_data",
          handler: MessageService.handleFillPersonalData,
        },
        {
          pattern: /edit_setting:(.+)/,
          handler: SettingsService.handleEditSettingButton,
        },
        {
          pattern: "cancel_edit",
          handler: SettingsService.handleCancelEdit,
        },
      ],
    };

    // Register basic commands
    for (const { command, handler } of commandHandlers.basic.filter(h => h.command)) {
      if (handler) {
        bot.command(command, handler);
      } else {
        logger.warn(`Handler for command '${command}' is undefined`);
      }
    }

    // Register action handlers (patterns)
    const allPatternHandlers = [
      ...commandHandlers.basic.filter(h => h.pattern),
      ...commandHandlers.features,
      ...commandHandlers.settings,
    ];

    for (const { pattern, handler } of allPatternHandlers) {
      if (handler) {
        bot.action(pattern, handler);
      } else {
        logger.warn(`Handler for pattern '${pattern}' is undefined`);
      }
    }

    // Register text message handler (catch-all)
    if (MessageService.handleText) {
      bot.on("text", MessageService.handleText);
    } else {
      logger.warn("MessageService.handleText is undefined");
    }

    // Register default command menu for users
    bot.telegram.setMyCommands([{ command: "start", description: "Start the bot" }]);

    logger.info("Bot commands and handlers setup complete");
  } catch (error) {
    logger.error("Error setting up commands:", error);
    throw error; // Throw the error for further handling
  }
};
