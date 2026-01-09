import { useState, useCallback, useRef, useEffect } from 'react';
import type { Section } from '../../types/types';

const INPUT_DEBOUNCE = 10; // ms

export const useAddSectionModal = () => {
  const [localReviewSection, setLocalReviewSection] = useState('');
  const [localMemorizationSection, setLocalMemorizationSection] = useState('');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Sync local state with external section
  const syncLocalState = useCallback((section: Omit<Section, '_id'>) => {
    setLocalReviewSection(section.reviewSection);
    setLocalMemorizationSection(section.memorizationSection);
  }, []);

  // Debounced input change handler
  const handleInputChange = useCallback(
    (
      name: string,
      value: string,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    ) => {
      // Update local state immediately
      if (name === 'reviewSection') {
        setLocalReviewSection(value);
      } else if (name === 'memorizationSection') {
        setLocalMemorizationSection(value);
      }

      // Clear previous timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Debounce parent state update
      debounceTimer.current = setTimeout(() => {
        onChange({ target: { name, value } } as React.ChangeEvent<HTMLInputElement>);
        debounceTimer.current = null;
      }, INPUT_DEBOUNCE);
    },
    []
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    localReviewSection,
    localMemorizationSection,
    syncLocalState,
    handleInputChange,
  };
};
