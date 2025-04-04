import logger from "../../utils/logger.js";

export class SectionHandler {
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

      // Динамически импортируем модули для устранения циклических зависимостей
      const { ProfileDisplay } = await import("./profileDisplay.js");
      const { EditStarter } = await import("./editStarter.js");
      const { SettingsService } = await import("./index.js");

      switch (section) {
        case "profile":
          await ProfileDisplay.showProfileSettings(ctx);
          break;
        case "edit_name":
          await EditStarter.startEditName(ctx);
          break;
        case "edit_birthdate":
          await EditStarter.startEditBirthdate(ctx);
          break;
        case "edit_birthtime":
          await EditStarter.startEditBirthtime(ctx);
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
}
