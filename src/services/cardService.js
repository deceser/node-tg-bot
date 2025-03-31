import { Markup } from "telegraf";
import { MESSAGES } from "../utils/constants.js";
import { drawRandomCard, formatCardPrediction } from "../data/cards.js";
import { checkCardAvailability, updateCardUsage } from "../data/userSettings.js";
import { CardApiService } from "./cardApiService.js";
import logger from "../utils/logger.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Get absolute path to the images directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IMAGES_DIR = path.join(__dirname, "../assets/images");

// Cache of users' last cards to prevent repetitions
const userLastCardCache = new Map();

// Flag for temporarily disabling paid cards
const PAID_CARDS_ENABLED = false;

export class CardService {
  /**
   * Creates a button for drawing a card
   * @param {boolean} freeAvailable - Whether a free card is available
   * @returns {Object} Inline keyboard object
   */
  static getCardButtons(freeAvailable) {
    const buttons = [];

    if (freeAvailable) {
      buttons.push([{ text: MESSAGES.CARD_BUTTON, callback_data: "draw_card" }]);
    } else if (PAID_CARDS_ENABLED) {
      buttons.push([{ text: MESSAGES.CARD_PAID_BUTTON, callback_data: "draw_paid_card" }]);
    } else {
      // If paid cards are disabled, show an inactive button
      buttons.push([{ text: MESSAGES.CARD_PAID_BUTTON_DISABLED, callback_data: "paid_cards_disabled" }]);
    }

    return Markup.inlineKeyboard(buttons);
  }

  /**
   * Creates confirmation buttons for a paid card
   * @returns {Object} Inline keyboard object
   */
  static getPaidCardConfirmationButtons() {
    return Markup.inlineKeyboard([
      [
        { text: "Подтвердить", callback_data: "confirm_paid_card" },
        { text: "Отмена", callback_data: "cancel_paid_card" },
      ],
    ]);
  }

  /**
   * Handles the card game command
   * @param {Object} ctx - Telegraf context
   */
  static async handleCardCommand(ctx) {
    try {
      const userId = ctx.from.id;
      logger.info("User requested card game", { userId });

      // Check card availability for the user
      const availability = checkCardAvailability(userId);

      if (availability.freeAvailable) {
        await ctx.reply(MESSAGES.CARD_INTRO, CardService.getCardButtons(true));
      } else {
        await ctx.reply(MESSAGES.CARD_LIMIT_REACHED, CardService.getCardButtons(false));
      }
    } catch (error) {
      logger.error("Error in handleCardCommand:", error);
      await ctx.reply(MESSAGES.ERROR);
    }
  }

  /**
   * Handles the "Draw card" button click
   * @param {Object} ctx - Telegraf context
   */
  static async handleDrawCard(ctx) {
    try {
      const userId = ctx.from.id;
      logger.info("User drew a free card", { userId });

      // Check free card availability
      const availability = checkCardAvailability(userId);

      if (!availability.freeAvailable) {
        await ctx.answerCbQuery("Бесплатные карты на сегодня закончились");
        await ctx.reply(MESSAGES.CARD_LIMIT_REACHED, CardService.getCardButtons(false));
        return;
      }

      // Try to answer the callback
      try {
        await ctx.answerCbQuery("Тяну карту...");
      } catch (cbError) {
        // Ignore error for outdated requests
        logger.warn("Could not answer callback query for card drawing", {
          userId,
          error: cbError.message,
        });
      }

      // Get a unique card from the API
      const lastCardId = userLastCardCache.get(userId);
      let card;

      try {
        // Try to get a card from the API
        card = await CardApiService.getUniqueCard(lastCardId);
      } catch (apiError) {
        logger.error("Error getting card from API, falling back to local cards", { userId, error: apiError.message });
        // If API doesn't work, use a local card
        card = drawRandomCard(lastCardId);
      }

      // Save card ID to prevent repetitions
      userLastCardCache.set(userId, card.id);

      const formattedPrediction = formatCardPrediction(card);

      // Update card usage counter
      updateCardUsage(userId, false);

      // Check if there's an image for the card
      const imagePath = card.image ? (card.image.startsWith("http") ? null : path.join(IMAGES_DIR, card.image)) : null;

      try {
        if (imagePath && fs.existsSync(imagePath)) {
          // Send local image with prediction
          await ctx.replyWithPhoto(
            { source: fs.createReadStream(imagePath) },
            {
              caption: formattedPrediction,
              parse_mode: "Markdown",
            }
          );
        } else if (card.image && card.image.startsWith("http")) {
          // Send image by URL
          await ctx.replyWithPhoto(
            { url: card.image },
            {
              caption: formattedPrediction,
              parse_mode: "Markdown",
            }
          );
        } else {
          // If there's no image, send text only
          await ctx.reply(formattedPrediction, { parse_mode: "Markdown" });
        }
      } catch (sendError) {
        logger.error("Error sending card", { userId, error: sendError.message });

        // In case of an error sending the image, send text only
        await ctx.reply(formattedPrediction, { parse_mode: "Markdown" });
      }

      // Clear old cache entries after 24 hours
      setTimeout(
        () => {
          if (userLastCardCache.get(userId) === card.id) {
            userLastCardCache.delete(userId);
          }
        },
        24 * 60 * 60 * 1000
      );

      // Inform about the next available card
      setTimeout(async () => {
        try {
          await ctx.reply(MESSAGES.CARD_NEXT_FREE);
        } catch (replyError) {
          logger.error("Error sending next card info", { userId, error: replyError.message });
        }
      }, 2000);
    } catch (error) {
      logger.error("Error in handleDrawCard:", error);

      // Try to send an error message to the user
      try {
        await ctx.reply(MESSAGES.ERROR);
      } catch (replyError) {
        logger.error("Failed to send error message for card drawing", {
          userId: ctx.from ? ctx.from.id : "unknown",
          error: replyError.message,
        });
      }
    }
  }

  /**
   * Handles paid card request
   * @param {Object} ctx - Telegraf context
   */
  static async handleDrawPaidCard(ctx) {
    try {
      const userId = ctx.from.id;
      logger.info("User requested paid card", { userId });

      if (!PAID_CARDS_ENABLED) {
        await ctx.answerCbQuery("Платные карты временно недоступны", { show_alert: true });
        return;
      }

      await ctx.answerCbQuery();
      await ctx.reply(MESSAGES.CARD_PAID_CONFIRMATION, CardService.getPaidCardConfirmationButtons());
    } catch (error) {
      logger.error("Error in handleDrawPaidCard:", error);
      await ctx.reply(MESSAGES.ERROR);
    }
  }

  /**
   * Handles paid card confirmation
   * @param {Object} ctx - Telegraf context
   */
  static async handleConfirmPaidCard(ctx) {
    try {
      const userId = ctx.from.id;
      logger.info("User confirmed paid card", { userId });

      await ctx.answerCbQuery("Обрабатываю платеж...");

      // Here should be payment system integration
      // For demonstration purposes, assume the payment was successful

      // Get a unique card from the API
      const lastCardId = userLastCardCache.get(userId);
      let card;

      try {
        // Try to get a card from the API
        card = await CardApiService.getUniqueCard(lastCardId);
      } catch (apiError) {
        logger.error("Error getting paid card from API, falling back to local cards", {
          userId,
          error: apiError.message,
        });
        // If API doesn't work, use a local card
        card = drawRandomCard(lastCardId);
      }

      // Save card ID to prevent repetitions
      userLastCardCache.set(userId, card.id);

      const formattedPrediction = formatCardPrediction(card);

      // Update card usage counter (mark as paid)
      updateCardUsage(userId, true);

      // Send card to the user
      await ctx.reply(MESSAGES.CARD_PAID_SUCCESS);

      // Check if there's an image for the card
      const imagePath = card.image ? (card.image.startsWith("http") ? null : path.join(IMAGES_DIR, card.image)) : null;

      try {
        if (imagePath && fs.existsSync(imagePath)) {
          // Send local image with prediction
          await ctx.replyWithPhoto(
            { source: fs.createReadStream(imagePath) },
            {
              caption: formattedPrediction,
              parse_mode: "Markdown",
            }
          );
        } else if (card.image && card.image.startsWith("http")) {
          // Send image by URL
          await ctx.replyWithPhoto(
            { url: card.image },
            {
              caption: formattedPrediction,
              parse_mode: "Markdown",
            }
          );
        } else {
          // If there's no image, send text only
          await ctx.reply(formattedPrediction, { parse_mode: "Markdown" });
        }
      } catch (sendError) {
        logger.error("Error sending paid card", { userId, error: sendError.message });
        await ctx.reply(formattedPrediction, { parse_mode: "Markdown" });
      }
    } catch (error) {
      logger.error("Error in handleConfirmPaidCard:", error);
      await ctx.reply(MESSAGES.ERROR);
    }
  }

  /**
   * Handles paid card cancellation
   * @param {Object} ctx - Telegraf context
   */
  static async handleCancelPaidCard(ctx) {
    try {
      const userId = ctx.from.id;
      logger.info("User canceled paid card", { userId });

      await ctx.answerCbQuery("Покупка отменена");
      await ctx.reply(MESSAGES.CARD_PAID_CANCEL);
    } catch (error) {
      logger.error("Error in handleCancelPaidCard:", error);
      await ctx.reply(MESSAGES.ERROR);
    }
  }

  /**
   * Handles click on disabled paid card button
   * @param {Object} ctx - Telegraf context
   */
  static async handlePaidCardsDisabled(ctx) {
    try {
      await ctx.answerCbQuery("Платные карты временно недоступны", { show_alert: true });
      await ctx.reply(MESSAGES.CARD_PAID_DISABLED);
    } catch (error) {
      logger.error("Error in handlePaidCardsDisabled:", error);
    }
  }

  /**
   * Checks if there's an images directory, and creates it if there's none
   */
  static ensureImagesDirectory() {
    if (!fs.existsSync(IMAGES_DIR)) {
      try {
        fs.mkdirSync(IMAGES_DIR, { recursive: true });
        logger.info("Created images directory:", IMAGES_DIR);
      } catch (error) {
        logger.error("Error creating images directory:", error);
      }
    }
  }
}
