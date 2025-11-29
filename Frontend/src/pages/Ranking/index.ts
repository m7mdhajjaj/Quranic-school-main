/**
 * Ranking Page - Central Exports
 * Makes it easier to import components from the Ranking module
 */

// Main Page
export { default as RankingPage } from "./RankingPage";
export { default } from "./RankingPage";

// Types
export type {
  StudentWithAverage,
  Group,
  User,
  FilterPanelProps,
  PodiumProps,
  RankingTableProps,
  UseRankingDataReturn,
  EmptyStateProps,
  PageHeaderProps,
} from "./types/ranking";

// Utils
export {
  getFullName,
  getMonthName,
  generateAvailableYears,
  getCurrentPeriod,
} from "./utils/rankingHelpers";

// Hooks
export { useRankingData } from "./hooks/useRankingData";

// Components
export { FilterPanel } from "./components/FilterPanel";
export { PageHeader } from "./components/PageHeader";
export { Podium } from "./components/Podium";
export { RankingTable } from "./components/RankingTable";
export { EmptyState } from "./components/EmptyState";
export { CriteriaCards } from "./components/CriteriaCards";
