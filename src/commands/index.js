import { startCommand } from "./start.js";
import { helpCommand } from "./help.js";
import { MessageService } from "../services/messageService.js";

export const setupCommands = bot => {
  // Register commands
  startCommand(bot);
  helpCommand(bot);

  // Register text message handler
  bot.hears(/.*/, MessageService.handleText);
};
