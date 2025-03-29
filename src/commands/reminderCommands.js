import { ReminderService } from "../services/reminderService.js";
import logger from "../utils/logger.js";
import { MESSAGES } from "../utils/constants.js";

export const setupReminderCommands = bot => {
  // Reminder creation command
  bot.command("remind", async ctx => {
    try {
      logger.info("Remind command received", { message: ctx.message.text });

      const input = ctx.message.text.replace("/remind", "").trim();

      if (!input) {
        await ctx.reply(MESSAGES.REMINDER_FORMAT);
        return;
      }

      // Improved regex for more flexible format support
      const match = input.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{1,2})\s+(.+)$/);

      if (!match) {
        logger.info("Invalid format", { input });
        await ctx.reply(MESSAGES.REMINDER_FORMAT);
        return;
      }

      // Split into components
      const [_, dayStr, monthStr, yearStr, hourStr, minuteStr, text] = match;

      // Convert to numbers and format
      const day = parseInt(dayStr, 10);
      const month = parseInt(monthStr, 10);
      const year = parseInt(yearStr, 10);
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);

      // Check date and time validity
      if (day < 1 || day > 31 || month < 1 || month > 12 || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        await ctx.reply("Некорректная дата или время. " + MESSAGES.REMINDER_FORMAT);
        return;
      }

      // Format date for saving
      const formattedDay = day.toString().padStart(2, "0");
      const formattedMonth = month.toString().padStart(2, "0");
      const formattedHour = hour.toString().padStart(2, "0");
      const formattedMinute = minute.toString().padStart(2, "0");

      const dateStr = `${formattedDay}.${formattedMonth}.${yearStr}`;
      const timeStr = `${formattedHour}:${formattedMinute}`;

      logger.info("Creating reminder", { dateStr, timeStr, text });

      await ReminderService.createReminder(ctx, text, `${dateStr} ${timeStr}`);
    } catch (error) {
      logger.error("Error in remind command:", error);
      await ctx.reply(MESSAGES.ERROR);
    }
  });

  // List reminders command
  bot.command("reminders", async ctx => {
    try {
      logger.info("Listing reminders for user", { userId: ctx.from.id });
      await ReminderService.listReminders(ctx);
    } catch (error) {
      logger.error("Error in reminders command:", error);
      await ctx.reply(MESSAGES.ERROR);
    }
  });

  // Delete reminder command
  bot.command("delete_reminder", async ctx => {
    try {
      const reminderId = ctx.message.text.split(" ")[1];

      if (!reminderId) {
        await ctx.reply("Укажите ID напоминания для удаления. Например: /delete_reminder 60a1c5b3e5d8f123456789ab");
        return;
      }

      logger.info("Deleting reminder", { reminderId, userId: ctx.from.id });
      await ReminderService.deleteReminder(ctx, reminderId);
    } catch (error) {
      logger.error("Error in delete_reminder command:", error);
      await ctx.reply(MESSAGES.ERROR);
    }
  });
};
