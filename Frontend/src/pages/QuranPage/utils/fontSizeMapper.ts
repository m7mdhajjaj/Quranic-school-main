/**
 * Maps font size number to Tailwind font size class
 * @param fontSize - Font size in pixels
 * @returns Tailwind font size class
 */
export const getFontSizeClass = (fontSize: number): "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" => {
  if (fontSize <= 14) return "sm";
  if (fontSize <= 16) return "base";
  if (fontSize <= 18) return "lg";
  if (fontSize <= 22) return "xl";
  if (fontSize <= 26) return "2xl";
  return "3xl";
};
