import { COMMANDS, COMMAND_DESCRIPTIONS } from "../utils/constants.js";
import { MessageService } from "../services/messageService.js";
import { CardService } from "../services/cardService.js";
import { SettingsService } from "../services/settingsService.js";
import { AstrologyService } from "../services/astrologyService.js";
import logger from "../utils/logger.js";

export const setupCommands = async bot => {
  // Registration of basic commands
  bot.command(COMMANDS.START, MessageService.handleStart);
  bot.command(COMMANDS.HELP, MessageService.handleHelp);
  bot.command(COMMANDS.CARD, CardService.handleCardCommand);
  bot.command(COMMANDS.SETTINGS, SettingsService.handleSettingsCommand);
  bot.command(COMMANDS.MENU, MessageService.showMainMenu);
  bot.command(COMMANDS.ASTROLOGY, AstrologyService.handleAstrologyCommand);
  bot.command(COMMANDS.TAROT, MessageService.handleTarotCommand);

  // Processing cards
  bot.action("draw_card", CardService.handleDrawCard);
  bot.action("draw_paid_card", CardService.handleDrawPaidCard);
  bot.action("confirm_paid_card", CardService.handleConfirmPaidCard);
  bot.action("cancel_paid_card", CardService.handleCancelPaidCard);
  bot.action("paid_cards_disabled", CardService.handlePaidCardsDisabled);

  // Processing astrology actions
  bot.action("astrology_form", AstrologyService.handleAstrologyForm);
  bot.action("astrology_cancel", AstrologyService.handleAstrologyCancel);
  bot.action("tarot_card", AstrologyService.handleTarotCard);
  bot.action("get_astrology", AstrologyService.handleAstrologyRequest);

  // Processing settings
  bot.action(/settings:(.+)/, ctx => {
    const section = ctx.match[1];
    return SettingsService.handleSettingsSection(ctx, section);
  });

  // Processing button clicks
  bot.action(/command:(.+)/, MessageService.handleCommandButton);

  // Обновляем обработчик для переадресации команды GET_HOROSCOPE на handleAstrologyRequest
  bot.action(`command:${COMMANDS.GET_HOROSCOPE}`, AstrologyService.handleAstrologyRequest);

  // Обработка заполнения персональных данных
  bot.action("fill_personal_data", MessageService.handleFillPersonalData);

  // Registration of text message handler (should be after all specific handlers)
  bot.on("text", MessageService.handleText);

  // Initialize task scheduler
  const { SchedulerService } = await import("../services/schedulerService.js");
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
