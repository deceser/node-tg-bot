import { MessageService } from "../services/messageService.js";

export const helpCommand = bot => {
  bot.command("help", MessageService.handleHelp);
};
