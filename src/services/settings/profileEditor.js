import logger from "../../utils/logger.js";
import { checkValidDateFormat, checkValidTimeFormat } from "../../utils/validation.js";
import { getUserSettings, saveUserSettings } from "../../data/userSettings.js";
import { profileEditState, EDIT_STATES } from "./editState.js";

export class ProfileEditor {
  /**
   * Handles text messages for profile editing
   * @param {Object} ctx - Telegraf context
   * @returns {boolean} - Returns true if the message was processed
   */
  static async handleProfileEdit(ctx) {
    const userId = ctx.from.id;
    const editSetting = profileEditState.get(userId);

    // Not in edit mode
    if (!editSetting) {
      return false;
    }

    const text = ctx.message.text;
    const settings = getUserSettings(userId);

    try {
      // Process setting update based on type
      switch (editSetting) {
        case EDIT_STATES.EDITING_NAME:
          return await ProfileEditor._handleNameEdit(ctx, settings, text);

        case EDIT_STATES.EDITING_BIRTHDATE:
          return await ProfileEditor._handleBirthdateEdit(ctx, settings, text);

        case EDIT_STATES.EDITING_BIRTHTIME:
          return await ProfileEditor._handleBirthtimeEdit(ctx, settings, text);

        default:
          // Unknown setting - cancel edit
          profileEditState.delete(userId);
          return false;
      }
    } catch (error) {
      logger.error("Error in profile edit:", { userId, error: error.message });
      await ctx.reply("An error occurred while updating your profile. Please try again.");
      profileEditState.delete(userId);
      return true;
    }
  }

  /**
   * Handle name edit
   * @private
   */
  static async _handleNameEdit(ctx, settings, text) {
    const userId = ctx.from.id;

    // Update name in settings
    settings.name = text;
    saveUserSettings(userId, settings);

    // Clear edit state
    profileEditState.delete(userId);

    await ctx.reply(`Your name has been updated to: ${text}`);

    // Show settings menu again
    await import("./index.js").then(module => {
      return module.SettingsService.handleSettingsCommand(ctx);
    });
    return true;
  }

  /**
   * Handle birthdate edit
   * @private
   */
  static async _handleBirthdateEdit(ctx, settings, text) {
    const userId = ctx.from.id;

    // Validate date format
    if (!checkValidDateFormat(text)) {
      await ctx.reply("Invalid date format. Please use YYYY-MM-DD (e.g., 1990-01-31):");
      return true;
    }

    // Update birthdate in settings
    settings.birthdate = text;

    // Mark that personal data is set if we also have other required fields
    if (settings.name && settings.birthtime) {
      settings.personalDataSet = true;
    }

    saveUserSettings(userId, settings);

    // Clear edit state
    profileEditState.delete(userId);

    await ctx.reply(`Your birth date has been updated to: ${text}`);

    // Show settings menu again
    await import("./index.js").then(module => {
      return module.SettingsService.handleSettingsCommand(ctx);
    });
    return true;
  }

  /**
   * Handle birthtime edit
   * @private
   */
  static async _handleBirthtimeEdit(ctx, settings, text) {
    const userId = ctx.from.id;

    // Validate time format
    if (!checkValidTimeFormat(text)) {
      await ctx.reply("Invalid time format. Please use HH:MM in 24-hour format (e.g., 15:30):");
      return true;
    }

    // Update birthtime in settings
    settings.birthtime = text;

    // Mark that personal data is set if we also have other required fields
    if (settings.name && settings.birthdate) {
      settings.personalDataSet = true;
    }

    saveUserSettings(userId, settings);

    // Clear edit state
    profileEditState.delete(userId);

    await ctx.reply(`Your birth time has been updated to: ${text}`);

    // Show settings menu again
    await import("./index.js").then(module => {
      return module.SettingsService.handleSettingsCommand(ctx);
    });
    return true;
  }
}
