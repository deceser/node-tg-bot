import { CardApiClient } from "./card/cardApiClient.js";
import { CardFormatter } from "./card/cardFormatter.js";
import { CardHandler } from "./card/cardHandler.js";
import { CardSender } from "./card/cardSender.js";
import { CardUtils } from "./card/cardUtils.js";

export class CardService {
  /**
   * Gets a tarot card from Roxy API
   * @returns {Promise<Object>} Card data
   */
  static async getCard() {
    return CardApiClient.getCard();
  }

  /**
   * Formats raw card data from API
   * @private
   */
  static _formatCardData(rawData) {
    return CardFormatter.formatCardData(rawData);
  }

  /**
   * Returns the appropriate buttons for card actions based on availability
   * @returns {Object} Markup with appropriate buttons
   */
  static getCardButtons() {
    return CardHandler.getCardButtons();
  }

  /**
   * Handles drawing a tarot card
   * @param {Object} ctx - Telegraf context
   */
  static async handleDrawCard(ctx) {
    return CardHandler.handleDrawCard(ctx);
  }

  /**
   * Sends card to user with appropriate formatting
   * @private
   */
  static async _sendCardToUser(ctx, card) {
    return CardSender.sendCardToUser(ctx, card);
  }

  /**
   * Formats card data into a caption/message
   * @private
   */
  static _formatCardCaption(card) {
    return CardFormatter.formatCardCaption(card);
  }

  /**
   * Checks if there's an images directory, and creates it if there's none
   */
  static ensureImagesDirectory() {
    return CardUtils.ensureImagesDirectory();
  }

  /**
   * Returns emoji for Tarot card
   * @param {Object} card - Card data
   * @returns {string} Emoji
   */
  static getCardEmoji(card) {
    return CardFormatter.getCardEmoji(card);
  }
}
