export const MESSAGES = {
  START: "Привет! Я ваш персональный помощник. Чем могу помочь?",
  HELP: "Я умею выполнять простые задачи: отправлять напоминания, планировать встречи и даже переводить голосовые сообщения. Напишите мне что-нибудь!",
  ERROR: "Произошла ошибка. Пожалуйста, попробуйте позже.",
  REMINDER_HELP: `
Команды для работы с напоминаниями:

/remind ДД.ММ.ГГГГ ЧЧ:ММ Текст - Создать напоминание
/reminders - Показать список напоминаний
/delete_reminder ID - Удалить напоминание

Пример:
/remind 25.12.2024 15:30 Купить подарки`,
  REMINDER_FORMAT:
    "Используйте формат:\n/remind ДД.ММ.ГГГГ ЧЧ:ММ Текст напоминания\n\nНапример:\n/remind 28.03.2025 15:30 Купить подарки",
  REMINDER_SET: "✅ Напоминание установлено!",
  REMINDER_LIST_EMPTY: "У вас нет активных напоминаний",
  REMINDER_INVALID_DATE: "❌ Дата и время должны быть в будущем",
  REMINDER_ERROR: "❌ Ошибка при создании напоминания",
};

export const COMMANDS = {
  START: "start",
  HELP: "help",
  REMIND: "remind",
  REMINDERS: "reminders",
  DELETE_REMINDER: "delete_reminder",
};

export const COMMAND_DESCRIPTIONS = {
  START: "Начать работу с ботом",
  HELP: "Показать справку по командам",
  REMIND: "Создать напоминание",
  REMINDERS: "Показать список напоминаний",
  DELETE_REMINDER: "Удалить напоминание",
};

export const SERVER_CONFIG = {
  PORT: process.env.PORT || 3000,
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
};

export const BOT_CONFIG = {
  handlerTimeout: 90000, // 90 seconds
  polling: {
    interval: 300, // 300ms
    autoStart: false, // Don't start polling automatically
  },
};
