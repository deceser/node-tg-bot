export const MESSAGES = {
  START: "Добро пожаловать! Для начала работы с ботом, пожалуйста, заполните персональные данные.",
  HELP: "Я умею предоставлять персональные астрологические прогнозы и играть в игру 'Вытянуть карту дня'. Используйте кнопки в меню для навигации.",
  ERROR: "Произошла ошибка. Пожалуйста, попробуйте позже.",
  CARD_INTRO: "Нажмите кнопку, чтобы вытянуть карту дня с предсказанием.",
  CARD_BUTTON: "Вытянуть карту",
  CARD_LIMIT_REACHED: "Вы уже вытянули карту сегодня. Следующая карта будет доступна завтра.",
  CARD_NEXT_FREE: "Следующая бесплатная карта будет доступна завтра.",
  CARD_DRAWING: "Выбираю карту Таро... Одну секунду.",
  CARD_ERROR: "Не удалось получить карту Таро. Пожалуйста, попробуйте позже.",
  CARD_INTERPRETATION_INTRO: "Обдумайте значение этой карты в контексте вашей ситуации.",
  ASTROLOGY_INTRO: "Для получения персонального астрологического прогноза укажите информацию о рождении.",
  ASTROLOGY_FORM: "Заполните форму данных для анализа",
  ASTROLOGY_NAME_PROMPT: "Введите ваше имя:",
  ASTROLOGY_BIRTHDATE_PROMPT: "Введите дату рождения (ГГГГ-ММ-ДД):",
  ASTROLOGY_BIRTHTIME_PROMPT: "Введите время рождения (ЧЧ:ММ):",
  ASTROLOGY_CANCEL: "Отмена",
  ASTROLOGY_PROCESSING: "Получаем астрологические данные... Это может занять некоторое время.",
  ASTROLOGY_COMPLETE: "Ваш персональный астрологический отчет готов!",
  ASTROLOGY_ERROR: "Не удалось получить астрологические данные. Убедитесь, что введены корректные данные.",
  PERSONAL_DATA_SAVED: "Ваши данные успешно сохранены! Теперь вы можете получить персональный гороскоп.",
  GET_HOROSCOPE: "Получить гороскоп",
  MENU_BUTTON: "Главное меню",
  BACK_BUTTON: "Назад",
  NO_PERSONAL_DATA: "Для получения гороскопа необходимо сначала заполнить персональные данные.",
  FILL_DATA_BUTTON: "Заполнить данные",
  PERSONAL_DATA_REQUIRED: "Для получения гороскопа необходимо сначала заполнить персональные данные.",
  FILL_PERSONAL_DATA: "Заполнить данные для гороскопа",
  TAROT_BUTTON: "Получить карту Таро",
  TAROT_PROCESSING: "Выбираю карту Таро... Одну секунду.",
  TAROT_ERROR: "Не удалось получить карту Таро. Пожалуйста, попробуйте позже.",
  // New messages for API error handling
  API_ERROR_GENERAL: "Сервис временно недоступен. Пожалуйста, попробуйте позже.",
  API_ERROR_TIMEOUT: "Превышено время ожидания ответа от сервиса. Пожалуйста, попробуйте позже.",
  API_ERROR_AUTH: "Ошибка авторизации при доступе к сервису. Администратор был уведомлен.",
  API_ERROR_RATE_LIMIT: "Превышен лимит запросов к сервису. Пожалуйста, попробуйте позже.",
  API_ERROR_SERVER: "Сервер временно недоступен. Мы работаем над устранением проблемы.",
};

export const COMMANDS = {
  START: "start",
  HELP: "help",
  SETTINGS: "settings",
  ASTROLOGY: "astrology",
  MENU: "menu",
  GET_HOROSCOPE: "gethoroscope",
  TAROT: "tarot",
};

export const COMMAND_DESCRIPTIONS = {
  START: "Начать работу с ботом",
  HELP: "Показать справку по командам",
  SETTINGS: "Настройки уведомлений",
  ASTROLOGY: "Персональный астрологический прогноз",
  TAROT: "Получить карту Таро",
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

// RoxyAPI configuration
export const ROXY_API_CONFIG = {
  BASE_URL: "https://roxyapi.com/api/v1/data/astro",
  ENDPOINTS: {
    ZODIAC_DETAILS: "/astrology/zodiac",
    PERSONALITY: "/astrology/personality",
    TAROT_SINGLE_CARD: "/tarot/single-card-draw",
  },
  TIMEOUT: 15000, // 15 seconds
  RETRIES: 2,
  RETRY_DELAY: 1000, // Delay between retries in ms
  BACKOFF_FACTOR: 1.5, // Exponential backoff factor
};

// Constants for Tarot card formatting
export const TAROT_FORMAT = {
  NAME_PREFIX: "**Карта:**",
  MEANING_PREFIX: "**Значение:**",
  REVERSED_PREFIX: "**В перевернутом положении:**",
  MESSAGE_PREFIX: "**Послание:**",
  REVERSED_INDICATOR: "(Перевернутая)",
};

// Parameters for card requests
export const TAROT_PARAMS = {
  REVERSED_PROBABILITY: 0.3, // Probability of getting a reversed card
};
