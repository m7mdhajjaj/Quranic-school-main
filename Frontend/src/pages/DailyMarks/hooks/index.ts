/**
 * Central export file for all Daily Marks hooks
 * Organized by category for better maintainability
 */

// ============================================================================
// DATA MANAGEMENT HOOKS
// ============================================================================
export { useDailyMarksData } from './useDailyMarksData';
export { useFilteredMarksData } from './useFilteredMarksData';
export { useStudentAverages } from './useStudentAverages';
export { useDailyMarksState } from './useDailyMarksState';
export { useSectionsFilter } from './useSectionsFilter';

// ============================================================================
// BUSINESS LOGIC HOOKS
// ============================================================================
export { useDailyMarksHandlers } from './useDailyMarksHandlers';
export { useModalActions } from './useModalActions';
export { useStudentSelection } from './useStudentSelection';

// ============================================================================
// UI & INTERACTION HOOKS
// ============================================================================
export { useInputHandlers } from './useInputHandlers';
export { useComputedValues } from './useComputedValues';
export { useFilteredStudents } from './useFilteredStudents';
