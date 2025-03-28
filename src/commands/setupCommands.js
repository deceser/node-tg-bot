import { COMMANDS, COMMAND_DESCRIPTIONS } from "../utils/constants.js";
import { MessageService } from "../services/messageService.js";

export const setupCommands = async bot => {
  // Register commands
  bot.command(COMMANDS.START, MessageService.handleStart);
  bot.command(COMMANDS.HELP, MessageService.handleHelp);

  // Register text message handler
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
  ]);
};
