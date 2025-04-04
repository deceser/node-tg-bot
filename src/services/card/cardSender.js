import fs from "fs";
import path from "path";
import logger from "../../utils/logger.js";
import { IMAGES_DIR } from "./cardUtils.js";
import { CardFormatter } from "./cardFormatter.js";

export class CardSender {
  /**
   * Sends card to user with appropriate formatting
   */
  static async sendCardToUser(ctx, card) {
    // If we have an image, send it with the card data
    if (card.image) {
      logger.info(`Sending card image: ${card.image}`);

      try {
        // For images starting with http/https, send them directly
        if (card.image.startsWith("http")) {
          await ctx.replyWithPhoto(
            { url: card.image },
            {
              caption: CardFormatter.formatCardCaption(card),
            }
          );
        } else {
          // For local images, check if they exist first
          const imagePath = path.join(IMAGES_DIR, card.image);
          if (fs.existsSync(imagePath)) {
            await ctx.replyWithPhoto(
              { source: fs.createReadStream(imagePath) },
              {
                caption: CardFormatter.formatCardCaption(card),
              }
            );
          } else {
            throw new Error(`Local image not found: ${imagePath}`);
          }
        }
      } catch (error) {
        logger.error(`Failed to send card image: ${error.message}`);
        // If image sending fails, fall back to text-only
        await ctx.reply(`Не удалось отобразить изображение карты.\n\n${CardFormatter.formatCardCaption(card)}`);
      }
    } else {
      // No image, just send text
      logger.warn("No image available for card, sending text only");
      await ctx.reply(CardFormatter.formatCardCaption(card));
    }
  }
}
