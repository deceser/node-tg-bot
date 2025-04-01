import { COMMANDS, COMMAND_DESCRIPTIONS } from "../utils/constants.js";
import { MessageService } from "../services/messageService.js";
import { HoroscopeService } from "../services/horoscopeService.js";
import { CardService } from "../services/cardService.js";
import { SchedulerService } from "../services/schedulerService.js";
import { SettingsService } from "../services/settingsService.js";
import logger from "../utils/logger.js";

export const setupCommands = async bot => {
  // Registration of basic commands
  bot.command(COMMANDS.START, MessageService.handleStart);
  bot.command(COMMANDS.HELP, MessageService.handleHelp);
  bot.command(COMMANDS.HOROSCOPE, HoroscopeService.handleHoroscopeCommand);
  bot.command(COMMANDS.CARD, CardService.handleCardCommand);
  bot.command(COMMANDS.SETTINGS, SettingsService.handleSettingsCommand);

  // Processing callbacks from inline buttons
  bot.action(/zodiac:(.+)/, ctx => {
    const sign = ctx.match[1];
    return HoroscopeService.handleZodiacSelection(ctx, sign);
  });

  bot.action(/auto_horoscope:(on|off)/, ctx => {
    const enableAuto = ctx.match[1] === "on";
    return HoroscopeService.handleAutoHoroscopeSetup(ctx, enableAuto);
  });

  // Processing cards
  bot.action("draw_card", CardService.handleDrawCard);
  bot.action("draw_paid_card", CardService.handleDrawPaidCard);
  bot.action("confirm_paid_card", CardService.handleConfirmPaidCard);
  bot.action("cancel_paid_card", CardService.handleCancelPaidCard);
  bot.action("paid_cards_disabled", CardService.handlePaidCardsDisabled);

  // Processing settings
  bot.action(/settings:(.+)/, ctx => {
    const section = ctx.match[1];
    return SettingsService.handleSettingsSection(ctx, section);
  });

  bot.action(/settings_zodiac:(.+)/, ctx => {
    const sign = ctx.match[1];
    return SettingsService.handleZodiacSelection(ctx, sign);
  });

  // Processing button clicks
  bot.action(/command:(.+)/, MessageService.handleCommandButton);

  // Registration of text message handler
  bot.hears(/.*/, MessageService.handleText);

  // Initialize task scheduler
  SchedulerService.initScheduler(bot);

  // Check and create directory for card images
  CardService.ensureImagesDirectory();

  // Setting up command menu
  try {
    await bot.telegram.setMyCommands([{ command: COMMANDS.START, description: COMMAND_DESCRIPTIONS.START }]);
    logger.info("Bot commands registered successfully");
  } catch (error) {
    logger.error("Error setting up bot commands:", error);
  }
};
