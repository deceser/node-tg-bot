import { Markup } from "telegraf";
import { MESSAGES, ZODIAC_SIGNS } from "../utils/constants.js";
import { generateHoroscope, formatHoroscope } from "../data/horoscopes.js";
import { getUserSettings, saveUserSettings } from "../data/userSettings.js";
import logger from "../utils/logger.js";

// Map for tracking user requests
const activeRequests = new Map();

export class HoroscopeService {
  /**
   * Creates a keyboard with zodiac signs
   * @returns {Object} Inline keyboard object
   */
  static getZodiacKeyboard() {
    const buttons = Object.values(ZODIAC_SIGNS).map(sign => ({
      text: sign,
      callback_data: `zodiac:${sign}`,
    }));

    // Split buttons into rows of 3 buttons each
    const keyboard = [];
    for (let i = 0; i < buttons.length; i += 3) {
      keyboard.push(buttons.slice(i, i + 3));
    }

    return Markup.inlineKeyboard(keyboard);
  }

  /**
   * Creates a keyboard for setting up auto horoscope sending
   * @returns {Object} Inline keyboard object
   */
  static getAutoHoroscopeKeyboard() {
    return Markup.inlineKeyboard([
      [
        { text: "Да", callback_data: "auto_horoscope:on" },
        { text: "Нет", callback_data: "auto_horoscope:off" },
      ],
    ]);
  }

  /**
   * Handles the horoscope command
   * @param {Object} ctx - Telegraf context
   */
  static async handleHoroscopeCommand(ctx) {
    try {
      const userId = ctx.from?.id;
      if (!userId) {
        logger.warn("No user ID in context");
        return;
      }

      logger.info("User requested horoscope", { userId });
      await ctx.reply(MESSAGES.HOROSCOPE_INTRO, HoroscopeService.getZodiacKeyboard());
    } catch (error) {
      logger.error("Error in handleHoroscopeCommand:", error);
      try {
        await ctx.reply(MESSAGES.ERROR);
      } catch (replyError) {
        logger.error("Failed to send error message:", replyError);
      }
    }
  }

  /**
   * Handles the zodiac sign selection
   * @param {Object} ctx - Telegraf context
   * @param {string} sign - Selected zodiac sign
   */
  static async handleZodiacSelection(ctx, sign) {
    const userId = ctx.from?.id;
    if (!userId) {
      logger.warn("No user ID in context");
      return;
    }

    // Check if the request is already being processed
    if (activeRequests.get(userId)) {
      logger.info("Ignoring duplicate request", { userId, sign });
      return;
    }

    // Set a lock for this user
    activeRequests.set(userId, true);

    try {
      logger.info("User selected zodiac sign", { userId, sign });

      // Show loading status - ignore errors if they occur
      try {
        await ctx.answerCbQuery("Получаем гороскоп...");
      } catch (cbError) {
        // Ignore the error with an outdated request
        logger.warn("Could not answer callback query, continuing", {
          userId,
          error: cbError.message,
        });
      }

      // Form a unique identifier for the message
      const requestId = `${userId}-${Date.now()}`;

      // Set a temporary loading message
      let tempMessageSent = false;
      let tempMessageId = null;
      const loadingMessage = `Загружаем гороскоп для знака ${sign}... ⏳`;

      try {
        await ctx.editMessageText(loadingMessage);
      } catch (editError) {
        // If it's not possible to edit, send a new message
        logger.warn("Could not edit message, sending new loading message", { userId });
        try {
          const msg = await ctx.reply(loadingMessage);
          tempMessageSent = true;
          tempMessageId = msg.message_id;
        } catch (replyError) {
          logger.error("Failed to send loading message:", replyError);
          // Release the lock and exit
          activeRequests.delete(userId);
          return;
        }
      }

      // Save the selected zodiac sign in the user settings
      saveUserSettings(userId, { zodiacSign: sign });

      try {
        // Generate the horoscope
        const horoscope = await generateHoroscope(sign);
        const formattedHoroscope = formatHoroscope(horoscope);

        // Send the horoscope to the user
        if (tempMessageSent && tempMessageId) {
          // If we sent a temporary message, delete it and send a new one
          try {
            await ctx.deleteMessage(tempMessageId);
          } catch (deleteError) {
            logger.warn("Could not delete temporary message", { userId });
          }
          await ctx.reply(formattedHoroscope, { parse_mode: "Markdown" });
        } else {
          // Try to edit the original message
          try {
            await ctx.editMessageText(formattedHoroscope, { parse_mode: "Markdown" });
          } catch (editError) {
            // If it's not possible to edit, send a new message
            logger.warn("Could not edit message with horoscope, sending new", { userId });
            await ctx.reply(formattedHoroscope, { parse_mode: "Markdown" });
          }
        }

        // Suggest to set up auto horoscope sending with a delay
        setTimeout(async () => {
          try {
            await ctx.reply(MESSAGES.HOROSCOPE_AUTO_SETUP, HoroscopeService.getAutoHoroscopeKeyboard());
          } catch (error) {
            logger.error("Error sending auto setup prompt:", error);
          }
        }, 1000);
      } catch (error) {
        logger.error("Error generating or sending horoscope:", error);

        // Try to send an error message to the user
        try {
          if (tempMessageSent && tempMessageId) {
            await ctx.deleteMessage(tempMessageId);
          }
          await ctx.reply(`${MESSAGES.ERROR} (${error.message})`);
        } catch (replyError) {
          logger.error("Failed to send error message:", replyError);
        }
      } finally {
        // Important to release the lock after some time
        setTimeout(() => {
          activeRequests.delete(userId);
        }, 3000);
      }
    } catch (error) {
      logger.error("Error in handleZodiacSelection:", error);

      // Try to send an error message to the user
      try {
        await ctx.reply(`${MESSAGES.ERROR} (${error.message})`);
      } catch (replyError) {
        logger.error("Failed to send error message:", replyError);
      }

      // Release the lock
      activeRequests.delete(userId);
    }
  }

  /**
   * Handles the auto horoscope setup
   * @param {Object} ctx - Telegraf context
   * @param {boolean} enableAuto - Enable or disable auto horoscope sending
   */
  static async handleAutoHoroscopeSetup(ctx, enableAuto) {
    const userId = ctx.from?.id;
    if (!userId) {
      logger.warn("No user ID in context");
      return;
    }

    // Check if the request is already being processed
    if (activeRequests.get(userId)) {
      logger.info("Ignoring duplicate auto setup request", { userId });
      return;
    }

    // Set a lock for this user
    activeRequests.set(userId, true);

    try {
      logger.info("User set auto horoscope", { userId, enableAuto });

      // Try to answer the callback
      try {
        await ctx.answerCbQuery();
      } catch (cbError) {
        // Ignore the error
        logger.warn("Could not answer callback query", { userId });
      }

      // Save the auto horoscope setting
      saveUserSettings(userId, { autoHoroscope: enableAuto });

      // Send confirmation to the user
      try {
        await ctx.editMessageText(enableAuto ? MESSAGES.HOROSCOPE_AUTO_ON : MESSAGES.HOROSCOPE_AUTO_OFF);
      } catch (editError) {
        // If it's not possible to edit the message, send a new one
        await ctx.reply(enableAuto ? MESSAGES.HOROSCOPE_AUTO_ON : MESSAGES.HOROSCOPE_AUTO_OFF);
      }
    } catch (error) {
      logger.error("Error in handleAutoHoroscopeSetup:", error);
      try {
        await ctx.reply(MESSAGES.ERROR);
      } catch (replyError) {
        logger.error("Failed to send error message:", replyError);
      }
    } finally {
      // Important to release the lock after some time
      setTimeout(() => {
        activeRequests.delete(userId);
      }, 2000);
    }
  }

  /**
   * Sends the daily horoscope to the user
   * @param {Object} bot - Telegraf bot object
   * @param {number} userId - User ID
   */
  static async sendDailyHoroscope(bot, userId) {
    try {
      const settings = getUserSettings(userId);

      if (!settings.zodiacSign) {
        logger.warn("User has no zodiac sign set", { userId });
        return;
      }

      // Generate the horoscope
      const horoscope = await generateHoroscope(settings.zodiacSign);
      const formattedHoroscope = formatHoroscope(horoscope);

      // Send the horoscope
      await bot.telegram.sendMessage(userId, formattedHoroscope, {
        parse_mode: "Markdown",
      });

      logger.info("Daily horoscope sent", { userId, sign: settings.zodiacSign });
    } catch (error) {
      logger.error("Error sending daily horoscope:", error);
    }
  }
}
