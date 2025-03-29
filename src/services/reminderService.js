import { scheduleJob } from "node-schedule";
import { DateTime } from "luxon";
import { Reminder } from "../models/Reminder.js";
import logger from "../utils/logger.js";
import { MESSAGES } from "../utils/constants.js";

export class ReminderService {
  static activeJobs = new Map();

  static async createReminder(ctx, text, dateTimeStr) {
    try {
      logger.info("Starting reminder creation", { dateTimeStr, userId: ctx.from.id });

      // Parse date
      const [dateStr, timeStr] = dateTimeStr.split(" ");
      const [day, month, year] = dateStr.split(".");
      const [hours, minutes] = timeStr.split(":");

      logger.info("Parsed date components", { day, month, year, hours, minutes });

      // Use local timezone (system default)
      const now = DateTime.now();
      const zone = now.zoneName;

      // Create date using Luxon in local timezone
      const scheduledDate = DateTime.fromObject(
        {
          day: parseInt(day, 10),
          month: parseInt(month, 10),
          year: parseInt(year, 10),
          hour: parseInt(hours, 10),
          minute: parseInt(minutes, 10),
        },
        { zone }
      );

      logger.info("Created DateTime object", {
        isoDate: scheduledDate.toISO(),
        jsDate: scheduledDate.toJSDate(),
        isValid: scheduledDate.isValid,
        zone,
      });

      // Check date validity
      if (!scheduledDate.isValid) {
        const invalidReason = scheduledDate.invalidReason || "Unknown error";
        logger.error("Invalid date", { invalidReason });
        await ctx.reply(`Некорректная дата: ${invalidReason}. ${MESSAGES.REMINDER_FORMAT}`);
        return;
      }

      // Check that date is in the future
      if (scheduledDate < now) {
        await ctx.reply(MESSAGES.REMINDER_INVALID_DATE);
        return;
      }

      // Create reminder in database
      logger.info("Saving reminder to database");
      const reminder = await Reminder.create({
        userId: ctx.from.id,
        text,
        scheduledFor: scheduledDate.toJSDate(),
        timezone: zone,
      });

      logger.info("Reminder saved to DB", { reminderId: reminder._id });

      // Schedule reminder delivery
      this.scheduleReminder(reminder, ctx.telegram);

      // Send confirmation
      await ctx.reply(`${MESSAGES.REMINDER_SET}\n` + `📅 Дата: ${dateStr} в ${timeStr}\n` + `📝 Текст: ${text}`);

      logger.info("Reminder created successfully", {
        reminderId: reminder._id,
        userId: ctx.from.id,
        scheduledFor: scheduledDate.toISO(),
      });
    } catch (error) {
      logger.error("Error creating reminder:", error);
      await ctx.reply(MESSAGES.REMINDER_ERROR);
    }
  }

  static scheduleReminder(reminder, telegram) {
    try {
      const jobId = `reminder_${reminder._id}`;

      // If job already exists, cancel it
      const existingJob = this.activeJobs.get(jobId);
      if (existingJob) {
        logger.info(`Cancelling existing job for reminder ${reminder._id}`);
        existingJob.cancel();
        this.activeJobs.delete(jobId);
      }

      // Check if scheduled date is already in the past
      const reminderDate = new Date(reminder.scheduledFor);
      if (reminderDate <= new Date()) {
        logger.warn(`Reminder ${reminder._id} date is in the past, can't schedule`);
        return;
      }

      logger.info(`Scheduling reminder for ${reminderDate.toISOString()}`, {
        reminderId: reminder._id,
        userId: reminder.userId,
      });

      const job = scheduleJob(jobId, reminderDate, async () => {
        try {
          logger.info(`Executing reminder ${reminder._id}`);
          await telegram.sendMessage(reminder.userId, `🔔 НАПОМИНАНИЕ:\n\n📝 ${reminder.text}`);

          await Reminder.findByIdAndUpdate(reminder._id, {
            status: "completed",
            "metadata.lastNotified": new Date(),
          });

          this.activeJobs.delete(jobId);

          logger.info("Reminder sent successfully", {
            reminderId: reminder._id,
            userId: reminder.userId,
          });
        } catch (error) {
          logger.error("Error sending reminder:", error);
          await Reminder.findByIdAndUpdate(reminder._id, {
            status: "failed",
            "metadata.failureCount": reminder.metadata?.failureCount ? reminder.metadata.failureCount + 1 : 1,
            "metadata.lastError": error.message,
          });
        }
      });

      this.activeJobs.set(jobId, job);
      logger.info(`Reminder ${reminder._id} scheduled successfully`);
    } catch (error) {
      logger.error(`Error scheduling reminder ${reminder._id}:`, error);
    }
  }

  static async listReminders(ctx) {
    try {
      // Add debug log
      logger.info("Looking for reminders for user", {
        userId: ctx.from.id,
        method: "listReminders",
      });

      const reminders = await Reminder.find({
        userId: ctx.from.id,
        status: "pending",
      }).sort({ scheduledFor: 1 });

      logger.info(`Found ${reminders.length} reminders`, {
        count: reminders.length,
        userId: ctx.from.id,
      });

      if (!reminders.length) {
        await ctx.reply(MESSAGES.REMINDER_LIST_EMPTY);
        return;
      }

      const remindersList = reminders
        .map(reminder => {
          const date = DateTime.fromJSDate(reminder.scheduledFor).toFormat("dd.MM.yyyy HH:mm");
          return `📅 ${date}\n📝 ${reminder.text}\n🆔 ${reminder._id.toString()}`;
        })
        .join("\n\n");

      await ctx.reply(
        "📋 Ваши напоминания:\n\n" + remindersList + "\n\nДля удаления используйте команду /delete_reminder ID"
      );
    } catch (error) {
      logger.error("Error listing reminders:", error);
      await ctx.reply(MESSAGES.ERROR);
    }
  }

  static async deleteReminder(ctx, reminderId) {
    try {
      const reminder = await Reminder.findOneAndUpdate(
        {
          _id: reminderId,
          userId: ctx.from.id,
          status: "pending",
        },
        { status: "cancelled" }
      );

      if (!reminder) {
        await ctx.reply("Напоминание не найдено или уже выполнено");
        return;
      }

      const jobId = `reminder_${reminderId}`;
      const job = this.activeJobs.get(jobId);
      if (job) {
        job.cancel();
        this.activeJobs.delete(jobId);
      }

      await ctx.reply("✅ Напоминание успешно удалено");
    } catch (error) {
      logger.error("Error deleting reminder:", error);
      await ctx.reply("Произошла ошибка при удалении напоминания");
    }
  }

  static async loadActiveReminders(telegram) {
    try {
      const now = new Date();
      logger.info("Loading active reminders from database");

      const activeReminders = await Reminder.find({
        scheduledFor: { $gt: now },
        status: "pending",
      });

      logger.info(`Found ${activeReminders.length} active reminders`);

      // Counter for scheduled reminders
      let scheduledCount = 0;

      for (const reminder of activeReminders) {
        // Check if reminder isn't too far in the past (in case of long service outage)
        if (new Date(reminder.scheduledFor) > now) {
          this.scheduleReminder(reminder, telegram);
          scheduledCount++;
        } else {
          // Mark expired reminders as failed
          await Reminder.findByIdAndUpdate(reminder._id, {
            status: "failed",
            "metadata.failureCount": 1,
            "metadata.lastError": "Reminder expired during service outage",
          });
          logger.warn(`Reminder ${reminder._id} expired and marked as failed`);
        }
      }

      logger.info(`Successfully scheduled ${scheduledCount} active reminders`);
    } catch (error) {
      logger.error("Error loading active reminders:", error);
    }
  }
}
