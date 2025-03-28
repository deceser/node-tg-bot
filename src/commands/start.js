import { MessageService } from "../services/messageService.js";

export const startCommand = bot => {
  bot.command("start", MessageService.handleStart);
};
