import { Markup } from "telegraf";
import logger from "../../utils/logger.js";
import { MESSAGES, COMMANDS } from "../../utils/constants.js";
import { AstrologyDataFormatter } from "./astrologyDataFormatter.js";
import { userFormState } from "./astrologyCommandHandler.js";

// Form states
export const FORM_STATES = {
  IDLE: "idle",
  WAITING_NAME: "waiting_name",
  WAITING_BIRTHDATE: "waiting_birthdate",
  WAITING_BIRTHTIME: "waiting_birthtime",
  PROCESSING: "processing",
};

export class AstrologyFormHandler {
  /**
   * Handles click on astrology form button
   * @param {Object} ctx - Telegraf context
   */
  static async handleAstrologyForm(ctx) {
    try {
      const userId = ctx.from?.id;
      if (!userId) {
        logger.warn("No user ID in context");
        return;
      }

      // Answer callback query
      try {
        await ctx.answerCbQuery();
      } catch (error) {
        logger.warn("Could not answer callback query", { userId });
      }

      // Initialize empty form
      userFormState.set(userId, {
        state: FORM_STATES.WAITING_NAME,
        data: {},
      });

      // Request name
      await ctx.reply(MESSAGES.ASTROLOGY_NAME_PROMPT);
    } catch (error) {
      logger.error("Error in handleAstrologyForm:", error);
      try {
        await ctx.reply(MESSAGES.ERROR);
      } catch (replyError) {
        logger.error("Failed to send error message:", replyError);
      }
    }
  }

  /**
   * Handles astrology form cancellation
   * @param {Object} ctx - Telegraf context
   */
  static async handleAstrologyCancel(ctx) {
    try {
      const userId = ctx.from?.id;
      if (!userId) {
        logger.warn("No user ID in context");
        return;
      }

      // Answer callback query
      try {
        await ctx.answerCbQuery();
      } catch (error) {
        logger.warn("Could not answer callback query", { userId });
      }

      // Delete user's form data
      userFormState.delete(userId);

      // Send cancellation message
      try {
        await ctx.editMessageText("Data entry cancelled.");
      } catch (error) {
        await ctx.reply("Data entry cancelled.");
      }
    } catch (error) {
      logger.error("Error in handleAstrologyCancel:", error);
    }
  }

  /**
   * Handles text input for astrology form
   * @param {Object} ctx - Telegraf context
   */
  static async handleTextInput(ctx) {
    const userId = ctx.from?.id;
    if (!userId) return;

    // Check if user is filling out the astrology form
    const formData = userFormState.get(userId);
    if (!formData) return;

    try {
      const text = ctx.message.text;
      const currentState = formData.state;

      switch (currentState) {
        case FORM_STATES.WAITING_NAME:
          formData.data.name = text;
          formData.state = FORM_STATES.WAITING_BIRTHDATE;
          await ctx.reply(MESSAGES.ASTROLOGY_BIRTHDATE_PROMPT);
          break;

        case FORM_STATES.WAITING_BIRTHDATE:
          // Validate date format YYYY-MM-DD
          if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
            await ctx.reply("Please enter the date in YYYY-MM-DD format (e.g., 1990-01-31)");
            return;
          }
          formData.data.birthdate = text;
          formData.state = FORM_STATES.WAITING_BIRTHTIME;
          await ctx.reply(MESSAGES.ASTROLOGY_BIRTHTIME_PROMPT);
          break;

        case FORM_STATES.WAITING_BIRTHTIME:
          // Validate time format HH:MM
          if (!/^\d{2}:\d{2}$/.test(text)) {
            await ctx.reply("Please enter the time in HH:MM format (e.g., 15:30)");
            return;
          }
          formData.data.birthtime = text;
          formData.state = FORM_STATES.PROCESSING;

          // Notify about processing start
          await ctx.reply(MESSAGES.ASTROLOGY_PROCESSING);

          try {
            // Send request to API
            const astrologyData = await AstrologyDataFormatter.getAstrologyData(formData.data);

            // Format data - important to use await since the method is async
            const formattedData = await AstrologyDataFormatter.formatAstrologyData(astrologyData);

            // Send result
            await ctx.reply(formattedData, { parse_mode: "Markdown" });

            // Add button to return to main menu
            await ctx.reply(
              "Выберите действие:",
              Markup.inlineKeyboard([[Markup.button.callback(MESSAGES.MENU_BUTTON, `command:${COMMANDS.MENU}`)]])
            );
          } catch (dataError) {
            logger.error(`Failed to process astrology data: ${dataError.message}`);
            await ctx.reply(MESSAGES.ASTROLOGY_ERROR);
          }

          // Clear form state
          userFormState.delete(userId);
          break;
      }
    } catch (error) {
      logger.error("Error processing astrology form input:", error);
      await ctx.reply(MESSAGES.ASTROLOGY_ERROR);

      // Reset form state on error
      userFormState.delete(userId);
    }
  }
}
