import { DateTime } from "luxon";

export class ReminderValidator {
  static validateDateTime(dateTimeStr) {
    try {
      const dt = DateTime.fromFormat(dateTimeStr, "dd.MM.yyyy HH:mm");
      if (!dt.isValid) {
        return { isValid: false, error: "Неверный формат даты и времени" };
      }

      if (dt < DateTime.now()) {
        return { isValid: false, error: "Дата напоминания должна быть в будущем" };
      }

      return { isValid: true, dateTime: dt };
    } catch (error) {
      return { isValid: false, error: "Ошибка обработки даты" };
    }
  }

  static validateText(text) {
    if (!text || text.trim().length === 0) {
      return { isValid: false, error: "Текст напоминания не может быть пустым" };
    }

    if (text.length > 1000) {
      return { isValid: false, error: "Текст напоминания слишком длинный (максимум 1000 символов)" };
    }

    return { isValid: true };
  }
}
