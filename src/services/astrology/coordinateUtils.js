/**
 * Converts coordinates from DMS format to decimal
 * @param {string} dmsStr - Coordinate string in DMS format (e.g., 47°29'03")
 * @returns {number} Coordinate in decimal format
 */
export function convertDMSToDecimal(dmsStr) {
  // Remove all spaces
  dmsStr = dmsStr.replace(/\s+/g, "");

  // Check various coordinate formats
  let degrees = 0,
    minutes = 0,
    seconds = 0;
  let isNegative = false;

  // Check for negative coordinate
  if (dmsStr.startsWith("-")) {
    isNegative = true;
    dmsStr = dmsStr.substring(1);
  } else if (dmsStr.includes("S") || dmsStr.includes("W") || dmsStr.includes("З") || dmsStr.includes("Ю")) {
    isNegative = true;
  }

  // Extract degrees, minutes and seconds
  if (dmsStr.includes("°")) {
    const parts = dmsStr.split("°");
    degrees = parseFloat(parts[0]);
    if (parts[1]) {
      const minuteParts = parts[1].split("'");
      if (minuteParts[0]) {
        minutes = parseFloat(minuteParts[0]);
      }
      if (minuteParts[1]) {
        const secondParts = minuteParts[1].split('"');
        if (secondParts[0]) {
          seconds = parseFloat(secondParts[0]);
        }
      }
    }
  } else {
    // If no special symbols, try to parse as number
    return parseFloat(dmsStr);
  }

  // Convert to decimal format
  let decimal = degrees + minutes / 60 + seconds / 3600;
  return isNegative ? -decimal : decimal;
}
