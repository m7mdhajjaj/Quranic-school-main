/**
 * ============================================================================
 * useAiRepair Hook (V7 - Deprecated)
 * ============================================================================
 * 
 * V7: This functionality has been removed
 * Smart Scheduler and Auto-Repair are no longer part of the system
 * 
 * Kept as stub to prevent import errors during transition
 */

export const useAiRepair = () => {
  return {
    repairLoading: false,
    repairError: null,
    repairSuccess: false,
    handleRepairWithAI: () => {
      console.warn('useAiRepair: This feature has been removed in V7');
    },
    resetRepairState: () => {},
  };
};
