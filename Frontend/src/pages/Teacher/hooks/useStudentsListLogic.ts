import { useState, useCallback, useEffect, useRef } from "react";

export const useStudentsListLogic = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState<'ذكر' | 'أنثى' | 'all'>('all');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search term
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  const setGenderFilterValue = useCallback((value: 'ذكر' | 'أنثى' | 'all') => {
    setGenderFilter(value);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    clearSearch,
    debouncedSearchTerm,
    genderFilter,
    setGenderFilter: setGenderFilterValue,
  };
};
