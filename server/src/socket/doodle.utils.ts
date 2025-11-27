/**
 * Doodle utility functions for socket handlers
 */

/**
 * Validate hex color format
 */
function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}

/**
 * Sanitize color value
 * Ensures color is valid hex format
 *
 * @param color - Color to sanitize
 * @param defaultColor - Default color if invalid
 * @returns Sanitized color
 */
export function sanitizeColor(
  color: string,
  defaultColor: string = "#000000"
): string {
  return isValidHexColor(color) ? color : defaultColor;
}

/**
 * Sanitize stroke width
 * Clamps width to valid range
 *
 * @param width - Width to sanitize
 * @param min - Minimum width
 * @param max - Maximum width
 * @returns Sanitized width
 */
export function sanitizeWidth(
  width: number,
  min: number = 1,
  max: number = 50
): number {
  return Math.max(min, Math.min(max, width));
}
