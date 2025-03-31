export const MESSAGES = {
  START: "Привет! Я бот с гороскопом и предсказаниями. Выберите интересующую вас функцию в меню.",
  HELP: "Я умею предоставлять гороскоп на день и играть в игру 'Вытянуть карту дня'. Используйте команды /horoscope и /card соответственно.",
  ERROR: "Произошла ошибка. Пожалуйста, попробуйте позже.",
  HOROSCOPE_INTRO: "Выберите ваш знак зодиака для получения гороскопа на сегодня:",
  HOROSCOPE_AUTO_SETUP: "Хотите получать гороскоп автоматически каждое утро?",
  HOROSCOPE_AUTO_ON: "Отлично! Теперь вы будете получать гороскоп каждое утро в 8:00.",
  HOROSCOPE_AUTO_OFF: "Автоматическая отправка гороскопа отключена.",
  CARD_INTRO: "Нажмите кнопку, чтобы вытянуть карту дня с предсказанием.",
  CARD_BUTTON: "Вытянуть карту",
  CARD_PAID_BUTTON: "Вытянуть карту за 1$",
  CARD_PAID_BUTTON_DISABLED: "Платные карты (скоро)",
  CARD_LIMIT_REACHED: "Вы уже вытянули бесплатную карту сегодня. Следующая карта будет стоить 1$.",
  CARD_PAID_CONFIRMATION: "Подтвердите покупку карты за 1$.",
  CARD_PAID_SUCCESS: "Спасибо за покупку! Вот ваша карта:",
  CARD_PAID_CANCEL: "Покупка отменена. Возвращайтесь завтра за новой бесплатной картой!",
  CARD_NEXT_FREE: "Следующая бесплатная карта будет доступна завтра.",
  CARD_PAID_DISABLED:
    "Платные карты временно недоступны. Функция будет добавлена в ближайшее время. Возвращайтесь завтра за новой бесплатной картой!",
};

export const COMMANDS = {
  START: "start",
  HELP: "help",
  HOROSCOPE: "horoscope",
  CARD: "card",
  SETTINGS: "settings",
};

export const COMMAND_DESCRIPTIONS = {
  START: "Начать работу с ботом",
  HELP: "Показать справку по командам",
  HOROSCOPE: "Получить гороскоп на день",
  CARD: "Вытянуть карту дня с предсказанием",
  SETTINGS: "Настройки уведомлений",
};

export const ZODIAC_SIGNS = {
  ARIES: "Овен",
  TAURUS: "Телец",
  GEMINI: "Близнецы",
  CANCER: "Рак",
  LEO: "Лев",
  VIRGO: "Дева",
  LIBRA: "Весы",
  SCORPIO: "Скорпион",
  SAGITTARIUS: "Стрелец",
  CAPRICORN: "Козерог",
  AQUARIUS: "Водолей",
  PISCES: "Рыбы",
};

export const CARD_TYPES = {
  SUN: "🌞 Солнце",
  MOON: "🌙 Луна",
  COINS: "💼 Монеты",
  HEART: "❤️ Сердце",
  LIGHTNING: "⚡ Молния",
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

export const DAILY_NOTIFICATION_TIME = "0 8 * * *"; // Каждый день в 8:00
