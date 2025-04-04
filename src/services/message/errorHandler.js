import logger from "../../utils/logger.js";
import { MESSAGES } from "../../utils/constants.js";

// Error handler wrapper to standardize error handling
export const withErrorHandling = (handler, errorMessage = MESSAGES.ERROR) => {
  return async ctx => {
    try {
      return await handler(ctx);
    } catch (error) {
      const userId = ctx?.from?.id || "unknown";
      logger.error(`Error in ${handler.name || "handler"}:`, { userId, error: error.message, stack: error.stack });

      if (ctx && !ctx.webhookReply) {
        try {
          await ctx.reply(errorMessage);
        } catch (replyError) {
          logger.error(`Failed to send error message:`, { userId, error: replyError.message });
        }
      }
      return null;
    }
  };
};
