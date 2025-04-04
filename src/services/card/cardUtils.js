import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import logger from "../../utils/logger.js";

// Get absolute path to the images directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const IMAGES_DIR = path.join(__dirname, "../../assets/images");

export class CardUtils {
  /**
   * Checks if there's an images directory, and creates it if there's none
   */
  static ensureImagesDirectory() {
    if (!fs.existsSync(IMAGES_DIR)) {
      try {
        fs.mkdirSync(IMAGES_DIR, { recursive: true });
        logger.info("Created images directory:", IMAGES_DIR);
      } catch (error) {
        logger.error("Error creating images directory:", error);
      }
    }
  }
}
