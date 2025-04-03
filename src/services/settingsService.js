import { Markup } from "telegraf";
import { getUserSettings, saveUserSettings } from "../data/userSettings.js";
import logger from "../utils/logger.js";
import { MESSAGES, COMMANDS } from "../utils/constants.js";

// Объект для хранения состояния редактирования профиля
const profileEditState = new Map();

// Состояния редактирования
const EDIT_STATES = {
  IDLE: "idle",
  EDITING_NAME: "editing_name",
  EDITING_BIRTHDATE: "editing_birthdate",
  EDITING_BIRTHTIME: "editing_birthtime",
};

export class SettingsService {
  /**
   * Handles the settings command
   * @param {Object} ctx - Telegraf context
   */
  static async handleSettingsCommand(ctx) {
    try {
      const userId = ctx.from?.id;
      if (!userId) {
        logger.warn("No user ID in context");
        return;
      }

      logger.info("User requested settings", { userId });

      const settings = getUserSettings(userId);

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback("👤 Профиль", "settings:profile")],
        [Markup.button.callback(MESSAGES.BACK_BUTTON, `command:${COMMANDS.MENU}`)],
      ]);

      await ctx.reply("Ваши текущие настройки:", keyboard);
    } catch (error) {
      logger.error("Error in handleSettingsCommand:", error);
      try {
        await ctx.reply("Произошла ошибка при загрузке настроек. Пожалуйста, попробуйте позже.");
      } catch (replyError) {
        logger.error("Failed to send error message:", replyError);
      }
    }
  }

  /**
   * Handles the selection of a settings section
   * @param {Object} ctx - Telegraf context
   * @param {string} section - Settings section
   */
  static async handleSettingsSection(ctx, section) {
    try {
      const userId = ctx.from?.id;
      if (!userId) {
        logger.warn("No user ID in context");
        return;
      }

      logger.info("User selected settings section", { section, userId });

      try {
        await ctx.answerCbQuery();
      } catch (cbError) {
        logger.warn("Could not answer callback query", { error: cbError.message });
      }

      switch (section) {
        case "profile":
          await SettingsService.showProfileSettings(ctx);
          break;
        case "edit_name":
          await SettingsService.startEditName(ctx);
          break;
        case "edit_birthdate":
          await SettingsService.startEditBirthdate(ctx);
          break;
        case "edit_birthtime":
          await SettingsService.startEditBirthtime(ctx);
          break;
        case "back":
          await SettingsService.handleSettingsCommand(ctx);
          break;
        default:
          await ctx.reply("Неизвестный раздел настроек");
      }
    } catch (error) {
      logger.error("Error in handleSettingsSection:", error);
      try {
        await ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.");
      } catch (replyError) {
        logger.error("Failed to send error message:", replyError);
      }
    }
  }

  /**
   * Показывает настройки профиля
   * @param {Object} ctx - Telegraf context
   */
  static async showProfileSettings(ctx) {
    try {
      const userId = ctx.from?.id;
      if (!userId) {
        logger.warn("No user ID in context");
        return;
      }

      const settings = getUserSettings(userId);
      let profileText = "Ваши данные профиля:\n\n";

      if (settings.personalDataSet) {
        profileText += `Имя: ${settings.name || "Не задано"}\n`;
        profileText += `Дата рождения: ${settings.birthdate || "Не задана"}\n`;
        profileText += `Время рождения: ${settings.birthtime || "Не задано"}\n`;
      } else {
        profileText += "Персональные данные не заполнены.";
      }

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback("✏️ Изменить имя", "settings:edit_name")],
        [Markup.button.callback("🗓 Изменить дату рождения", "settings:edit_birthdate")],
        [Markup.button.callback("🕒 Изменить время рождения", "settings:edit_birthtime")],
        [Markup.button.callback(MESSAGES.BACK_BUTTON, "settings:back")],
      ]);

      await ctx.reply(profileText, keyboard);
    } catch (error) {
      logger.error("Error in showProfileSettings:", error);
      await ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.");
    }
  }

  /**
   * Начинает процесс редактирования имени
   * @param {Object} ctx - Telegraf context
   */
  static async startEditName(ctx) {
    try {
      const userId = ctx.from?.id;
      if (!userId) {
        logger.warn("No user ID in context");
        return;
      }

      // Сохраняем состояние редактирования
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
   * Начинает процесс редактирования даты рождения
   * @param {Object} ctx - Telegraf context
   */
  static async startEditBirthdate(ctx) {
    try {
      const userId = ctx.from?.id;
      if (!userId) {
        logger.warn("No user ID in context");
        return;
      }

      // Сохраняем состояние редактирования
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
   * Начинает процесс редактирования времени рождения
   * @param {Object} ctx - Telegraf context
   */
  static async startEditBirthtime(ctx) {
    try {
      const userId = ctx.from?.id;
      if (!userId) {
        logger.warn("No user ID in context");
        return;
      }

      // Сохраняем состояние редактирования
      profileEditState.set(userId, {
        state: EDIT_STATES.EDITING_BIRTHTIME,
      });

      await ctx.reply("Введите новое время рождения (формат ЧЧ:ММ):");
    } catch (error) {
      logger.error("Error in startEditBirthtime:", error);
      await ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.");
    }
  }

  /**
   * Обрабатывает текстовые сообщения для редактирования профиля
   * @param {Object} ctx - Telegraf context
   * @returns {boolean} - Возвращает true, если сообщение обработано
   */
  static async handleProfileEdit(ctx) {
    const userId = ctx.from?.id;
    if (!userId) return false;

    const editState = profileEditState.get(userId);
    if (!editState) return false;

    try {
      const text = ctx.message.text;
      const settings = getUserSettings(userId);
      let updateData = {};
      let errorMessage = null;

      switch (editState.state) {
        case EDIT_STATES.EDITING_NAME:
          updateData = { name: text };
          break;

        case EDIT_STATES.EDITING_BIRTHDATE:
          // Валидация формата даты YYYY-MM-DD
          if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
            errorMessage = "Пожалуйста, введите дату в формате ГГГГ-ММ-ДД (например, 1990-01-31)";
            return true;
          }
          updateData = { birthdate: text };
          break;

        case EDIT_STATES.EDITING_BIRTHTIME:
          // Валидация формата времени HH:MM
          if (!/^\d{2}:\d{2}$/.test(text)) {
            errorMessage = "Пожалуйста, введите время в формате ЧЧ:ММ (например, 15:30)";
            return true;
          }
          updateData = { birthtime: text };
          break;

        default:
          return false;
      }

      if (errorMessage) {
        await ctx.reply(errorMessage);
        return true;
      }

      // Обновляем настройки и устанавливаем флаг personalDataSet, если необходимо
      const newSettings = { ...updateData };
      if (!settings.personalDataSet && settings.name && settings.birthdate && settings.birthtime) {
        newSettings.personalDataSet = true;
      }

      saveUserSettings(userId, newSettings);

      // Очищаем состояние редактирования
      profileEditState.delete(userId);

      await ctx.reply("Данные успешно обновлены!");
      await SettingsService.showProfileSettings(ctx);

      return true;
    } catch (error) {
      logger.error("Error in handleProfileEdit:", error);
      await ctx.reply("Произошла ошибка при обновлении данных.");
      profileEditState.delete(userId);
      return true;
    }
  }
}
