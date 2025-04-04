import { Markup } from "telegraf";
import logger from "../../utils/logger.js";
import { MESSAGES, COMMANDS } from "../../utils/constants.js";
import { CardService } from "../cardService.js";

export class TarotCardHandler {
  /**
   * Handles click on Tarot card button
   * @param {Object} ctx - Telegraf context
   */
  static async handleTarotCard(ctx) {
    try {
      const userId = ctx.from?.id;
      if (!userId) {
        logger.warn("No user ID in context");
        return;
      }

      // Answer callback query
      try {
        await ctx.answerCbQuery(MESSAGES.TAROT_PROCESSING);
      } catch (error) {
        logger.warn("Could not answer callback query", { userId });
      }

      // Notify about processing start
      await ctx.reply(MESSAGES.ASTROLOGY_PROCESSING);

      // Get Tarot card from API
      try {
        const card = await CardService.getSingleCard();
        const formattedCard = await CardService.formatCardData(card);

        if (card.image) {
          // If there's an image for the card, send it with caption
          await ctx.replyWithPhoto(
            { url: card.image },
            {
              caption: formattedCard,
              parse_mode: "Markdown",
            }
          );
        } else {
          // If no image, send text only
          await ctx.reply(formattedCard, { parse_mode: "Markdown" });
        }

        // Add button to return to main menu
        await ctx.reply(
          "Выберите действие:",
          Markup.inlineKeyboard([[Markup.button.callback(MESSAGES.MENU_BUTTON, `command:${COMMANDS.MENU}`)]])
        );
      } catch (error) {
        logger.error(`Error getting tarot card: ${error.message}`);
        await ctx.reply(MESSAGES.TAROT_ERROR);
      }
    } catch (error) {
      logger.error("Error in handleTarotCard:", error);
      try {
        await ctx.reply(MESSAGES.ERROR);
      } catch (replyError) {
        logger.error("Failed to send error message:", replyError);
      }
    }
  }
}
