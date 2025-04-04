import logger from "../../utils/logger.js";

export class CardFormatter {
  /**
   * Formats raw card data from API
   */
  static formatCardData(rawData) {
    // Ensure we have valid data
    if (!rawData || !rawData.name) {
      throw new Error("Invalid card data from API");
    }

    let imageUrl = null;

    // Try to get image URL from different possible fields
    if (rawData.image_url) {
      imageUrl = rawData.image_url;
    } else if (rawData.image) {
      imageUrl = rawData.image;
    }

    logger.info(`Card image found: ${imageUrl ? "Yes" : "No"}`);

    return {
      name: rawData.name,
      meaning: rawData.meaning || "No meaning provided",
      image: imageUrl,
      description: rawData.description || "No description available",
      is_reversed: rawData.is_reversed || false,
      card_type: rawData.card_type || "minor",
      number: rawData.number || "",
    };
  }

  /**
   * Formats card data into a caption/message
   */
  static formatCardCaption(card) {
    const emoji = CardFormatter.getCardEmoji(card);
    const isReversed = card.is_reversed;
    const cardType = card.card_type || "minor";
    const cardNumber = card.number || "";

    // Format the card message with emojis and specified styling
    const message = [`${emoji} ${card.name} ${emoji}`];

    // Add reversed indicator if card is reversed
    if (isReversed) {
      message.push(`⚠️ Карта перевернута ⚠️`);
      message.push(``);
      message.push(`Перевернутое значение:`);
    } else {
      message.push(``);
      message.push(`Значение:`);
    }

    // Add card meaning
    message.push(card.meaning);

    // Add card type and number if available
    message.push(``);
    message.push(`Тип: ${cardType}`);

    if (cardNumber) {
      message.push(`Номер: ${cardNumber}`);
    }

    return message.join("\n");
  }

  /**
   * Returns emoji for Tarot card
   * @param {Object} card - Card data
   * @returns {string} Emoji
   */
  static getCardEmoji(card) {
    // If card is reversed, use a different set of emojis
    if (card.is_reversed) {
      return "🔮";
    }

    // Check card type
    if (card.card_type === "major") {
      return "✨";
    }

    // Determine emoji based on card name
    const cardName = card.name.toLowerCase();

    if (cardName.includes("cup") || cardName.includes("chalice")) {
      return "🏆";
    } else if (cardName.includes("sword")) {
      return "⚔️";
    } else if (cardName.includes("wand") || cardName.includes("staff")) {
      return "🪄";
    } else if (cardName.includes("pentacle") || cardName.includes("coin")) {
      return "💰";
    } else if (cardName.includes("fool")) {
      return "🃏";
    } else if (cardName.includes("star")) {
      return "⭐";
    } else if (cardName.includes("sun")) {
      return "☀️";
    } else if (cardName.includes("moon")) {
      return "🌙";
    } else if (cardName.includes("devil")) {
      return "😈";
    } else if (cardName.includes("tower")) {
      return "🗼";
    } else if (cardName.includes("death")) {
      return "💀";
    } else if (cardName.includes("emperor")) {
      return "👑";
    } else if (cardName.includes("empress")) {
      return "👸";
    } else if (cardName.includes("lovers")) {
      return "❤️";
    } else if (cardName.includes("chariot")) {
      return "🏎️";
    } else if (cardName.includes("strength")) {
      return "🦁";
    } else if (cardName.includes("hermit")) {
      return "🧙";
    } else if (cardName.includes("wheel")) {
      return "🎡";
    } else if (cardName.includes("justice")) {
      return "⚖️";
    } else if (cardName.includes("judgment")) {
      return "📯";
    } else if (cardName.includes("world")) {
      return "🌍";
    }

    return "🃏"; // General emoji for other cards
  }
}
