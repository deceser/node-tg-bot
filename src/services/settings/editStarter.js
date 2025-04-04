import logger from "../../utils/logger.js";
import { profileEditState, EDIT_STATES } from "./editState.js";

export class EditStarter {
  /**
   * Starts the name editing process
   * @param {Object} ctx - Telegraf context
   */
  static async startEditName(ctx) {
    try {
      const userId = ctx.from?.id;
      if (!userId) {
        logger.warn("No user ID in context");
        return;
      }

      // Save editing state
      profileEditState.set(userId, {
        state: EDIT_STATES.EDITING_NAME,
      });

      await ctx.reply("Введите новое имя:");
    } catch (error) {
      logger.error("Error in startEditName:", error);
      await ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.");
    }
  }

  /**
   * Starts the birth date editing process
   * @param {Object} ctx - Telegraf context
   */
  static async startEditBirthdate(ctx) {
    try {
      const userId = ctx.from?.id;
      if (!userId) {
        logger.warn("No user ID in context");
        return;
      }

      // Save editing state
      profileEditState.set(userId, {
        state: EDIT_STATES.EDITING_BIRTHDATE,
      });

      await ctx.reply("Введите новую дату рождения (формат ГГГГ-ММ-ДД):");
    } catch (error) {
      logger.error("Error in startEditBirthdate:", error);
      await ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.");
    }
  }

  /**
   * Starts the birth time editing process
   * @param {Object} ctx - Telegraf context
   */
  static async startEditBirthtime(ctx) {
    try {
      const userId = ctx.from?.id;
      if (!userId) {
        logger.warn("No user ID in context");
        return;
      }

      // Save editing state
      profileEditState.set(userId, {
        state: EDIT_STATES.EDITING_BIRTHTIME,
      });

      await ctx.reply("Введите новое время рождения (формат ЧЧ:ММ):");
    } catch (error) {
      logger.error("Error in startEditBirthtime:", error);
      await ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.");
    }
  }
}
