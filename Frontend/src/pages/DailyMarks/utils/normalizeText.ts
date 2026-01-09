// utils/normalizeText.ts
export function normalizeText(text: string): string {
  if (!text) return "";
  let normalized = text.toString().trim();
  normalized = normalized.replace(/[\u064B-\u065F]/g, ""); // Remove Harakat
  normalized = normalized.replace(/[أإآ]/g, "ا"); // Normalize Alef
  normalized = normalized.replace(/ى/g, "ي"); // Normalize Ya
  normalized = normalized.replace(/ة/g, "ه"); // Normalize Ta Marbuta
  return normalized;
}
