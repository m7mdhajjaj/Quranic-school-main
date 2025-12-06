// ============================================================================
// useViewMode - إدارة حالة طريقة العرض (Grid/Cards)
// ============================================================================

import { useState } from "react";

export type ViewMode = "grid" | "cards";

export const useViewMode = (defaultMode: ViewMode = "grid") => {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultMode);

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "grid" ? "cards" : "grid"));
  };

  const isGridView = viewMode === "grid";
  const isCardsView = viewMode === "cards";

  return {
    viewMode,
    setViewMode,
    toggleViewMode,
    isGridView,
    isCardsView,
  };
};
