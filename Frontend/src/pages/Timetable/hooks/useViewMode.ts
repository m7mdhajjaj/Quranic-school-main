// ============================================================================
// useViewMode - إدارة حالة طريقة العرض (Grid/Cards/Timeline)
// ============================================================================

import { useState } from "react";

export type ViewMode = "grid" | "cards" | "timeline";

export const useViewMode = (defaultMode: ViewMode = "grid") => {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultMode);

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "grid" ? "cards" : "grid"));
  };

  const isGridView = viewMode === "grid";
  const isCardsView = viewMode === "cards";
  const isTimelineView = viewMode === "timeline";

  return {
    viewMode,
    setViewMode,
    toggleViewMode,
    isGridView,
    isCardsView,
    isTimelineView,
  };
};
