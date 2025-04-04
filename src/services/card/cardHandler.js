import { Markup } from "telegraf";
import logger from "../../utils/logger.js";
import { MESSAGES, COMMANDS } from "../../utils/constants.js";
import { CardApiClient } from "./cardApiClient.js";
import { CardSender } from "./cardSender.js";

export class CardHandler {
  /**
   * Returns the appropriate buttons for card actions based on availability
   * @returns {Object} Markup with appropriate buttons
   */
  static getCardButtons() {
    const buttons = [];

    // Always add draw card button
    buttons.push([Markup.button.callback("🎴 Draw a Card", "draw_card")]);

    // Always add back button
    buttons.push([Markup.button.callback(MESSAGES.BACK_BUTTON, `command:${COMMANDS.MENU}`)]);

    return Markup.inlineKeyboard(buttons);
  }

  /**
   * Handles drawing a tarot card
   * @param {Object} ctx - Telegraf context
   */
  static async handleDrawCard(ctx) {
    const userId = ctx.from.id;
    logger.info("User drawing tarot card", { userId });

    try {
      // Get card from API
      await ctx.reply(MESSAGES.CARD_DRAWING);
      const card = await CardApiClient.getCard();

      // Send card information to user
      await CardSender.sendCardToUser(ctx, card);

      // Show back to menu button
      return ctx.reply(
        MESSAGES.CARD_INTERPRETATION_INTRO,
        Markup.inlineKeyboard([[Markup.button.callback(MESSAGES.BACK_BUTTON, `command:${COMMANDS.MENU}`)]])
      );
    } catch (error) {
      logger.error("Error handling draw card:", { userId, error: error.message });
      return ctx.reply(
        MESSAGES.CARD_ERROR,
        Markup.inlineKeyboard([[Markup.button.callback(MESSAGES.BACK_BUTTON, `command:${COMMANDS.MENU}`)]])
      );
    }
  }
}
