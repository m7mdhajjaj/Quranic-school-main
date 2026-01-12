// ============================================================================
// useViewMode - إدارة حالة طريقة العرض (Grid/Cards/Timeline)
// ============================================================================

import { useState, useMemo, useCallback } from "react";

export type ViewMode = "grid" | "cards" | "timeline";

export const useViewMode = (defaultMode: ViewMode = "grid") => {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultMode);

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === "grid" ? "cards" : "grid"));
  }, []);

  const isGridView = useMemo(() => viewMode === "grid", [viewMode]);
  const isCardsView = useMemo(() => viewMode === "cards", [viewMode]);
  const isTimelineView = useMemo(() => viewMode === "timeline", [viewMode]);

  return {
    viewMode,
    setViewMode,
    toggleViewMode,
    isGridView,
    isCardsView,
    isTimelineView,
  };
};
