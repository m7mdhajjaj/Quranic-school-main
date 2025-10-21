// ============================================================================
// cn - ClassName utility
// ============================================================================

/**
 * Combines class names, filtering out falsy values
 */
export const cn = (...cls: Array<string | false | null | undefined>) =>
  cls.filter(Boolean).join(" ");
