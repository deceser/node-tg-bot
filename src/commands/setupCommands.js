import { COMMANDS, COMMAND_DESCRIPTIONS } from "../utils/constants.js";
import { MessageService } from "../services/messageService.js";
import { setupReminderCommands } from "./reminderCommands.js";

export const setupCommands = async bot => {
  // Register commands
  bot.command(COMMANDS.START, MessageService.handleStart);
  bot.command(COMMANDS.HELP, MessageService.handleHelp);

  // Setup reminder commands
  setupReminderCommands(bot);

  // Register text message handler - should be the last one to avoid intercepting commands
  bot.hears(/.*/, MessageService.handleText);

  // Set up commands menu
  await bot.telegram.setMyCommands([
    {
      command: COMMANDS.START,
      description: COMMAND_DESCRIPTIONS.START,
    },
    {
      command: COMMANDS.HELP,
      description: COMMAND_DESCRIPTIONS.HELP,
    },
    {
      command: COMMANDS.REMIND,
      description: COMMAND_DESCRIPTIONS.REMIND,
    },
    {
      command: COMMANDS.REMINDERS,
      description: COMMAND_DESCRIPTIONS.REMINDERS,
    },
    {
      command: COMMANDS.DELETE_REMINDER,
      description: COMMAND_DESCRIPTIONS.DELETE_REMINDER,
    },
  ]);
};
