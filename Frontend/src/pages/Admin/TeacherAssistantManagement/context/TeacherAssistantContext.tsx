import React, { createContext, useContext, ReactNode } from "react";
import {
  useTeacherAssistantFilters,
  useTeacherAssistantSelection,
  useTeacherAssistantExport,
  useTeacherAssistantsData,
  useTeacherAssistantsActions,
  useTeacherAssistantsStats,
} from "../hooks";
import type { UseTeacherAssistantFiltersReturn } from "../hooks/useTeacherAssistantFilters";
import type { UseTeacherAssistantSelectionReturn } from "../hooks/useTeacherAssistantSelection";
import type { UseTeacherAssistantExportReturn } from "../hooks/useTeacherAssistantExport";
import type { TeacherAssistant } from "../types";
import type { TeacherAssistantFormData } from "../hooks/useTeacherAssistantForm";

// =================== Types ===================
interface TeacherAssistantStats {
  total: number;
  male: number;
  female: number;
  avgAge: number;
  malePercentage: number;
  femalePercentage: number;
}

interface TeacherAssistantContextValue {
  // Data
  assistants: TeacherAssistant[];
  stats: TeacherAssistantStats;
  error: string | null;
  isLoading: boolean;
  refetch: () => void;
  refetchStats: () => void;
  
  // Actions
  isSubmitting: boolean;
  createTeacherAssistant: (data: TeacherAssistantFormData) => Promise<any>;
  updateTeacherAssistant: (id: string, data: Partial<TeacherAssistantFormData>) => Promise<any>;
  deleteTeacherAssistant: (id: string) => Promise<any>;
  bulkDeleteTeacherAssistants: (ids: string[]) => Promise<any>;
}

// =================== Contexts ===================
const TeacherAssistantContext = createContext<TeacherAssistantContextValue | null>(null);
const FiltersContext = createContext<UseTeacherAssistantFiltersReturn | null>(null);
const SelectionContext = createContext<UseTeacherAssistantSelectionReturn | null>(null);
const ExportContext = createContext<UseTeacherAssistantExportReturn | null>(null);

// =================== Provider ===================
interface TeacherAssistantProviderProps {
  children: ReactNode;
}

export const TeacherAssistantProvider: React.FC<TeacherAssistantProviderProps> = ({ children }) => {
  // Filters Hook (منفصل)
  const filters = useTeacherAssistantFilters();
  
  // Selection Hook (منفصل)
  const selection = useTeacherAssistantSelection();
  
  // Export Hook (منفصل)
  const exportHook = useTeacherAssistantExport();
  
  // Data Hook (يستخدم filters من context)
  const { assistants, error, isLoading, refetch } = useTeacherAssistantsData(filters.filtersParams);
  
  // Actions Hook
  const {
    createTeacherAssistant,
    updateTeacherAssistant,
    deleteTeacherAssistant,
    bulkDeleteTeacherAssistants,
    isSubmitting,
  } = useTeacherAssistantsActions();
  
  // Stats Hook
  const { refetch: refetchStats, ...stats } = useTeacherAssistantsStats();

  // Main Context Value
  const contextValue: TeacherAssistantContextValue = {
    assistants,
    stats,
    error,
    isLoading,
    refetch,
    refetchStats,
    isSubmitting,
    createTeacherAssistant,
    updateTeacherAssistant,
    deleteTeacherAssistant,
    bulkDeleteTeacherAssistants,
  };

  return (
    <TeacherAssistantContext.Provider value={contextValue}>
      <FiltersContext.Provider value={filters}>
        <SelectionContext.Provider value={selection}>
          <ExportContext.Provider value={exportHook}>
            {children}
          </ExportContext.Provider>
        </SelectionContext.Provider>
      </FiltersContext.Provider>
    </TeacherAssistantContext.Provider>
  );
};

// =================== Hooks ===================
export const useTeacherAssistantContext = () => {
  const context = useContext(TeacherAssistantContext);
  if (!context) {
    throw new Error("useTeacherAssistantContext must be used within TeacherAssistantProvider");
  }
  return context;
};

export const useFiltersContext = () => {
  const context = useContext(FiltersContext);
  if (!context) {
    throw new Error("useFiltersContext must be used within TeacherAssistantProvider");
  }
  return context;
};

export const useSelectionContext = () => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error("useSelectionContext must be used within TeacherAssistantProvider");
  }
  return context;
};

export const useExportContext = () => {
  const context = useContext(ExportContext);
  if (!context) {
    throw new Error("useExportContext must be used within TeacherAssistantProvider");
  }
  return context;
};
