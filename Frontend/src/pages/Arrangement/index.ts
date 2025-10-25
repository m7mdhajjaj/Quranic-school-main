/**
 * Arrangement Page - Central Exports
 * Makes it easier to import components from the Arrangement module
 */

// Main Page
export { default as ArrangementPage } from "./ArrangementPage";
export { default } from "./ArrangementPage";

// Types
export type {
  StudentWithAverage,
  Group,
  User,
  FilterPanelProps,
  PodiumProps,
  RankingTableProps,
  UseRankingDataReturn,
} from "./types/arrangement";

// Utils
export {
  getFullName,
  getMonthName,
  generateAvailableYears,
  getCurrentPeriod,
} from "./utils/arrangementHelpers";

// Hooks
export { useRankingData } from "./hooks/useRankingData";

// Components
export { FilterPanel } from "./components/FilterPanel";
export { PageHeader } from "./components/PageHeader";
export { Podium } from "./components/Podium";
export { RankingTable } from "./components/RankingTable";
export { EmptyState } from "./components/EmptyState";
export { CriteriaCards } from "./components/CriteriaCards";
