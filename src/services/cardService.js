import { Markup } from "telegraf";
import { MESSAGES, CARD_SERVICE_CONFIG, ROXY_API_CONFIG } from "../utils/constants.js";
import { drawRandomCard, formatCardPrediction } from "../data/cards.js";
import { checkCardAvailability, updateCardUsage } from "../data/userSettings.js";
import logger from "../utils/logger.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import axios from "axios";
import { config } from "../config/config.js";

// Get absolute path to the images directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IMAGES_DIR = path.join(__dirname, "../assets/images");

// Cache of users' last cards to prevent repetitions
const userLastCardCache = new Map();

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
    } else if (CARD_SERVICE_CONFIG.PAID_CARDS_ENABLED) {
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
   * Gets a unique card from the API
   * @param {string} excludeId - ID of the card to exclude
   * @returns {Promise<Object>} Card data object
   */
  static async getUniqueCard(excludeId = null, retryCount = 0) {
    try {
      logger.info(`Fetching unique card from API, attempt ${retryCount + 1}`);

      // API request
      const response = await axios.get(CARD_SERVICE_CONFIG.API_URL, {
        timeout: CARD_SERVICE_CONFIG.API_TIMEOUT,
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "TelegramBot/1.0",
        },
        params: {
          exclude: excludeId,
        },
      });

      // Check the status and presence of data
      if (response.status !== 200 || !response.data) {
        throw new Error(`API responded with code ${response.status} or returned empty data`);
      }

      // Format the data to the correct format
      const cardData = CardService.formatApiResponse(response.data);

      logger.info(`Successfully fetched unique card from API`);
      return cardData;
    } catch (error) {
      // Check the possibility of retrying
      if (retryCount < CARD_SERVICE_CONFIG.MAX_RETRIES) {
        logger.warn(`Retry ${retryCount + 1} for card API`);
        await new Promise(resolve => setTimeout(resolve, CARD_SERVICE_CONFIG.RETRY_DELAY));
        return CardService.getUniqueCard(excludeId, retryCount + 1);
      }

      // Log the error and return the local card
      logger.error("Error fetching card from API, using local fallback:", error);
      return drawRandomCard(excludeId);
    }
  }

  /**
   * Formats the API response to the correct format for the bot
   * @param {Object} apiResponse - Response from the API
   * @returns {Object} Formatted card object
   */
  static formatApiResponse(apiResponse) {
    try {
      const card = apiResponse.card || apiResponse;

      return {
        id: card.id || `api_card_${Date.now()}`,
        name: card.name || "Неизвестная карта",
        image: card.image_url || null,
        prediction: card.description || card.meaning || "Эта карта говорит о неожиданных изменениях в вашей жизни.",
        fromApi: true,
      };
    } catch (error) {
      logger.error("Error formatting API response:", error);
      // Return a simple card in case of an error
      return {
        id: `fallback_${Date.now()}`,
        name: "Мистическая карта",
        image: null,
        prediction: "Сегодня вас ждет что-то особенное. Будьте внимательны к знакам вокруг.",
        fromApi: true,
      };
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
        card = await CardService.getUniqueCard(lastCardId);
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

      if (!CARD_SERVICE_CONFIG.PAID_CARDS_ENABLED) {
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
        card = await CardService.getUniqueCard(lastCardId);
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

  /**
   * Gets a single Tarot card
   * @param {number} reversedProbability - Probability of getting a reversed card (0-1)
   * @returns {Promise<Object>} Card data
   */
  static async getSingleCard(reversedProbability = 0.2) {
    try {
      logger.info(`Fetching single tarot card from RoxyAPI`);

      const response = await axios.get(`${ROXY_API_CONFIG.BASE_URL}${ROXY_API_CONFIG.ENDPOINTS.TAROT_SINGLE_CARD}`, {
        params: {
          token: config.ROXY_API_TOKEN,
          reversed_probability: reversedProbability,
        },
        headers: {
          "Content-Type": "application/json",
        },
        timeout: ROXY_API_CONFIG.TIMEOUT,
      });

      if (response.status !== 200 || !response.data) {
        throw new Error(`RoxyAPI responded with code ${response.status}`);
      }

      logger.info(`Successfully fetched single tarot card`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching tarot card: ${error.message}`);
      throw error;
    }
  }

  /**
   * Formats Tarot card data for display
   * @param {Object} card - Card data
   * @returns {Promise<string>} Formatted text
   */
  static async formatCardData(card) {
    try {
      if (!card || !card.name) {
        return "Не удалось получить информацию о карте Таро.";
      }

      // Get emoji for the card based on name or type
      const cardEmoji = CardService.getCardEmoji(card);

      // Use original card values
      const meaningTitle = card.is_reversed ? "Перевернутое значение" : "Значение";
      const meaning = card.is_reversed ? card.reversed_meaning : card.meaning;
      const message = card.message || "";

      // Format the response text
      let result = `${cardEmoji} *Карта Таро: ${card.name}* ${cardEmoji}\n\n`;

      if (card.is_reversed) {
        result += "⚠️ *Карта перевернута* ⚠️\n\n";
      }

      result += `*${meaningTitle}:*\n${meaning}\n\n`;

      if (message) {
        result += `*Послание карты:*\n${message}\n\n`;
      }

      if (card.card_type) {
        result += `*Тип:* ${card.card_type}\n`;
      }

      if (card.sequence) {
        result += `*Номер:* ${card.sequence}\n`;
      }

      return result;
    } catch (error) {
      logger.error(`Error formatting tarot card data: ${error.message}`);
      return "Произошла ошибка при форматировании данных карты Таро.";
    }
  }

  /**
   * Returns emoji for Tarot card
   * @param {Object} card - Card data
   * @returns {string} Emoji
   */
  static getCardEmoji(card) {
    // If card is reversed, use a different set of emojis
    if (card.is_reversed) {
      return "🔮";
    }

    // Check card type
    if (card.card_type === "major") {
      return "✨";
    }

    // Determine emoji based on card name
    const cardName = card.name.toLowerCase();

    if (cardName.includes("cup") || cardName.includes("chalice")) {
      return "🏆";
    } else if (cardName.includes("sword")) {
      return "⚔️";
    } else if (cardName.includes("wand") || cardName.includes("staff")) {
      return "🪄";
    } else if (cardName.includes("pentacle") || cardName.includes("coin")) {
      return "💰";
    } else if (cardName.includes("fool")) {
      return "🃏";
    } else if (cardName.includes("star")) {
      return "⭐";
    } else if (cardName.includes("sun")) {
      return "☀️";
    } else if (cardName.includes("moon")) {
      return "🌙";
    } else if (cardName.includes("devil")) {
      return "😈";
    } else if (cardName.includes("tower")) {
      return "🗼";
    } else if (cardName.includes("death")) {
      return "💀";
    } else if (cardName.includes("emperor")) {
      return "👑";
    } else if (cardName.includes("empress")) {
      return "👸";
    } else if (cardName.includes("lovers")) {
      return "❤️";
    } else if (cardName.includes("chariot")) {
      return "🏎️";
    } else if (cardName.includes("strength")) {
      return "🦁";
    } else if (cardName.includes("hermit")) {
      return "🧙";
    } else if (cardName.includes("wheel")) {
      return "🎡";
    } else if (cardName.includes("justice")) {
      return "⚖️";
    } else if (cardName.includes("judgment")) {
      return "📯";
    } else if (cardName.includes("world")) {
      return "🌍";
    }

    return "🃏"; // General emoji for other cards
  }
}
