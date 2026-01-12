// ============================================================================
// Hooks Index - Barrel Export (Organized by Category)
// ============================================================================

// 📊 Data Management Hooks
export { useTimetableData } from "./data/useTimetableData";
export { useTimetableActions } from "./data/useTimetableActions";

// 📝 Form Management Hooks
export { useSessionForm } from "./form/useSessionForm";
export { useSessionModalLogic } from "./form/useSessionModalLogic";
export { useSessionDuration } from "./form/useSessionDuration";
export { useSessionModalController } from "./form/useSessionModalController";

// 🎨 Display & View Hooks
export { useViewMode } from "./display/useViewMode";
export { useWeeklyGrid } from "./display/useWeeklyGrid";
export { useWeekFilter, getWeekRange, formatWeekRange } from "./display/useWeekFilter";
export type { WeekRange } from "./display/useWeekFilter";

// 👥 Selection & Filtering Hooks
export { useTeachers } from "./selection/useTeachers";
export { useTeacherGroups } from "./selection/useTeacherGroups";
export { useTeacherSelection } from "./selection/useTeacherSelection";
