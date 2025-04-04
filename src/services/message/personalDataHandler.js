import { Markup } from "telegraf";
import logger from "../../utils/logger.js";
import { MESSAGES } from "../../utils/constants.js";
import { saveUserSettings } from "../../data/userSettings.js";
import { userFormState, FORM_STATES } from "./formState.js";
import { MenuHandler } from "./menuHandler.js";

export class PersonalDataHandler {
  /**
   * Handles personal data input from user
   * @param {Object} ctx - Telegraf context
   */
  static async handlePersonalDataInput(ctx) {
    const userId = ctx.from.id;
    const formData = userFormState.get(userId);

    if (!formData) return;

    const text = ctx.message.text;
    const currentState = formData.state;

    try {
      switch (currentState) {
        case FORM_STATES.WAITING_NAME:
          return await PersonalDataHandler._handleNameInput(ctx, formData, text);

        case FORM_STATES.WAITING_BIRTHDATE:
          return await PersonalDataHandler._handleBirthdateInput(ctx, formData, text);

        case FORM_STATES.WAITING_BIRTHTIME:
          return await PersonalDataHandler._handleBirthtimeInput(ctx, formData, text);

        default:
          userFormState.delete(userId);
          return MenuHandler.showMainMenu(ctx);
      }
    } catch (error) {
      logger.error("Error processing personal data input:", error);
      await ctx.reply(MESSAGES.ERROR);

      // Reset form state on error
      userFormState.delete(userId);
    }
  }

  /**
   * Handle name input step
   * @private
   */
  static async _handleNameInput(ctx, formData, text) {
    formData.data.name = text;
    formData.state = FORM_STATES.WAITING_BIRTHDATE;
    return ctx.reply(MESSAGES.ASTROLOGY_BIRTHDATE_PROMPT);
  }

  /**
   * Handle birthdate input step
   * @private
   */
  static async _handleBirthdateInput(ctx, formData, text) {
    // Validate date format YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      return ctx.reply("Введите дату в формате ГГГГ-ММ-ДД (например, 1990-01-31)");
    }

    formData.data.birthdate = text;
    formData.state = FORM_STATES.WAITING_BIRTHTIME;
    return ctx.reply(MESSAGES.ASTROLOGY_BIRTHTIME_PROMPT);
  }

  /**
   * Handle birthtime input step
   * @private
   */
  static async _handleBirthtimeInput(ctx, formData, text) {
    const userId = ctx.from.id;

    // Validate time format HH:MM
    if (!/^\d{2}:\d{2}$/.test(text)) {
      return ctx.reply("Введите время в формате ЧЧ:ММ (например, 15:30)");
    }

    formData.data.birthtime = text;

    // Save user data
    saveUserSettings(userId, {
      name: formData.data.name,
      birthdate: formData.data.birthdate,
      birthtime: formData.data.birthtime,
      personalDataSet: true,
    });

    // Clear form state
    userFormState.delete(userId);

    await ctx.reply(MESSAGES.PERSONAL_DATA_SAVED);
    return MenuHandler.showMainMenu(ctx);
  }

  /**
   * Starts the process of filling personal data
   * @param {Object} ctx - Telegraf context
   */
  static async handleFillPersonalData(ctx) {
    const userId = ctx.from.id;

    // Initialize form data with starting state
    userFormState.set(userId, {
      state: FORM_STATES.WAITING_NAME,
      data: {},
    });

    await ctx.reply(MESSAGES.START);
    return ctx.reply(MESSAGES.ASTROLOGY_NAME_PROMPT);
  }
}
