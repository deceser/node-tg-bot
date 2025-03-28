export const MESSAGES = {
  START: "Привет! Я ваш персональный помощник. Чем могу помочь?",
  HELP: "Я умею выполнять простые задачи: отправлять напоминания, планировать встречи и даже переводить голосовые сообщения. Напишите мне что-нибудь!",
  ERROR: "Произошла ошибка. Пожалуйста, попробуйте позже.",
};

export const COMMANDS = {
  START: "start",
  HELP: "help",
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
