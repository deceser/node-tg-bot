export const MESSAGES = {
  START: "Добро пожаловать! Для начала работы с ботом, пожалуйста, заполните персональные данные.",
  HELP: "Я умею предоставлять персональные астрологические прогнозы и играть в игру 'Вытянуть карту дня'. Используйте кнопки в меню для навигации.",
  ERROR: "Произошла ошибка. Пожалуйста, попробуйте позже.",
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
  PERSONAL_DATA_REQUIRED: "Для получения гороскопа необходимо сначала заполнить персональные данные.",
  FILL_PERSONAL_DATA: "Заполнить данные для гороскопа",
  TAROT_BUTTON: "Получить карту Таро",
  TAROT_PROCESSING: "Выбираю карту Таро... Одну секунду.",
  TAROT_ERROR: "Не удалось получить карту Таро. Пожалуйста, попробуйте позже.",
};

export const COMMANDS = {
  START: "start",
  HELP: "help",
  CARD: "card",
  SETTINGS: "settings",
  ASTROLOGY: "astrology",
  MENU: "menu",
  GET_HOROSCOPE: "gethoroscope",
  TAROT: "tarot",
};

export const COMMAND_DESCRIPTIONS = {
  START: "Начать работу с ботом",
  HELP: "Показать справку по командам",
  CARD: "Вытянуть карту дня с предсказанием",
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

export const DAILY_NOTIFICATION_TIME = "0 8 * * *"; // Каждый день в 8:00

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
};

// Card service configuration
export const CARD_SERVICE_CONFIG = {
  PAID_CARDS_ENABLED: false,
  API_URL: "https://api.example.com/tarot-cards",
  API_TIMEOUT: 10000,
  MAX_RETRIES: 2,
  RETRY_DELAY: 1000,
};
