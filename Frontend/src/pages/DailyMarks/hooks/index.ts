/**
 * ============================================================================
 * Daily Marks Hooks - Central Export File
 * ============================================================================
 * 
 * Organized by category for better maintainability and discoverability.
 * All custom hooks for Daily Marks functionality are exported from here.
 */

// ============================================================================
// 📊 DATA MANAGEMENT HOOKS
// ============================================================================

/**
 * useDailyMarksData - Loads basic data (user, students, groups)
 * useFilteredMarksData - Fetches filtered sections and marks from API
 * useDailyMarksState - Centralizes all component state management
 * useStudentAverages - Fetches student averages from backend
 * useSectionsFilter - Manages month/year/day filter state
 */
export { useDailyMarksData } from './useDailyMarksData';
export { useFilteredMarksData } from './useFilteredMarksData';
export { useDailyMarksState } from './useDailyMarksState';
export { useStudentAverages } from './useStudentAverages';
export { useSectionsFilter } from './useSectionsFilter';

// ============================================================================
// 🎯 BUSINESS LOGIC HOOKS
// ============================================================================

/**
 * useDailyMarksHandlers - Handles all CRUD operations and bulk actions
 * useModalAndFormActions - Manages modal actions and form inputs (merged hook)
 * useStudentSelection - Manages student and group selection with transitions
 */
export { useDailyMarksHandlers } from './useDailyMarksHandlers';
export { useModalAndFormActions } from './useModalAndFormActions';
export { useStudentSelection } from './useStudentSelection';

// ============================================================================
// 🧮 COMPUTED VALUES & FILTERING HOOKS
// ============================================================================

/**
 * useComputedValues - Provides memoized computed values
 * useFilteredStudents - Filters students by selected group
 * useStudentIdForAverages - Determines correct student ID for averages
 * useGroupStats - Fetches group statistics (students count, sections count)
 */
export { useComputedValues } from './useComputedValues';
export { useFilteredStudents } from './useFilteredStudents';
export { useStudentIdForAverages } from './useStudentIdForAverages';
export { useGroupStats } from './useGroupStats';

// ============================================================================
// 🧭 NAVIGATION & UI HOOKS
// ============================================================================

/**
 * useMonthNavigation - Handles month/year navigation
 * useMarkFinder - Finds and attaches marks to sections
 */
export { useMonthNavigation } from './useMonthNavigation';
export { useMarkFinder } from './useMarkFinder';
