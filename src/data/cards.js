import { CARD_TYPES } from "../utils/constants.js";

// Database of cards with predictions
export const cards = [
  {
    id: "sun",
    name: CARD_TYPES.SUN,
    image: "sun.jpg", // Relative path to the image
    prediction:
      "Сегодня твой день! Удача на твоей стороне. Все начинания принесут положительные результаты, а твоя энергия привлечет нужных людей.",
  },
  {
    id: "moon",
    name: CARD_TYPES.MOON,
    image: "moon.jpg",
    prediction:
      "Будь внимателен к интуиции, она подскажет верный путь. Сегодняшний день благоприятен для медитации, самопознания и отдыха.",
  },
  {
    id: "coins",
    name: CARD_TYPES.COINS,
    image: "coins.jpg",
    prediction:
      "Финансовый успех ждет тебя, но будь осмотрителен. Хороший день для инвестиций и планирования бюджета, но избегай импульсивных трат.",
  },
  {
    id: "heart",
    name: CARD_TYPES.HEART,
    image: "heart.jpg",
    prediction:
      "Любовь и гармония наполнят твой день. Отличное время для романтики, укрепления отношений и проявления заботы к близким.",
  },
  {
    id: "lightning",
    name: CARD_TYPES.LIGHTNING,
    image: "lightning.jpg",
    prediction:
      "Ожидай неожиданностей, будь гибким! Сегодня возможны внезапные изменения и сюрпризы. Готовность адаптироваться поможет превратить их в возможности.",
  },
];

/**
 * Draws a random card from the deck
 * @param {string} excludeCardId - ID of the card to exclude from selection
 * @returns {Object} Card object with prediction
 */
export const drawRandomCard = excludeCardId => {
  // If we need to exclude a card and there's more than one card in the deck
  if (excludeCardId && cards.length > 1) {
    // Filter cards, excluding the card with the specified ID
    const availableCards = cards.filter(card => card.id !== excludeCardId);

    // Select a random card from available ones
    const randomIndex = Math.floor(Math.random() * availableCards.length);
    return availableCards[randomIndex];
  } else {
    // Regular random card selection
    const randomIndex = Math.floor(Math.random() * cards.length);
    return cards[randomIndex];
  }
};

/**
 * Formats card prediction for sending to user
 * @param {Object} card - Card object
 * @returns {string} Formatted prediction text
 */
export const formatCardPrediction = card => {
  return `${card.name}\n\n*Предсказание:*\n${card.prediction}`;
};
