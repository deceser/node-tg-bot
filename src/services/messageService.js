import logger from "../utils/logger.js";
import { MESSAGES } from "../utils/constants.js";

export class MessageService {
  static async handleStart(ctx) {
    try {
      logger.info("User started the bot", { userId: ctx.from.id });
      await ctx.reply(MESSAGES.START);
    } catch (error) {
      logger.error("Error in handleStart:", error);
      await ctx.reply(MESSAGES.ERROR);
    }
  }

  static async handleHelp(ctx) {
    try {
      logger.info("User requested help", { userId: ctx.from.id });
      await ctx.reply(MESSAGES.HELP);
    } catch (error) {
      logger.error("Error in handleHelp:", error);
      await ctx.reply(MESSAGES.ERROR);
    }
  }

  static async handleText(ctx) {
    try {
      const { text } = ctx.message;
      logger.info("Received message", {
        userId: ctx.from.id,
        message: text,
      });
      await ctx.reply(`Вы написали: ${text}`);
    } catch (error) {
      logger.error("Error in handleText:", error);
      await ctx.reply(MESSAGES.ERROR);
    }
  }
}
