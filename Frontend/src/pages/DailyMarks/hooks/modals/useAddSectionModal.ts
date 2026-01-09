import { useState, useCallback, useRef, useEffect } from 'react';
import type { Section } from '../../types/types';
import type { QuranSegmentData } from '@/Validation/dailyMarksValidation';

const INPUT_DEBOUNCE = 10; // ms

export const useAddSectionModal = () => {
  const [localReviewSection, setLocalReviewSection] = useState('');
  const [localMemorizationSection, setLocalMemorizationSection] = useState('');
  
  // New Structured State
  const [localReviewMeta, setLocalReviewMeta] = useState<QuranSegmentData[]>([]);
  const [localMemorizationMeta, setLocalMemorizationMeta] = useState<QuranSegmentData[]>([]);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Sync local state with external section
  const syncLocalState = useCallback((section: Partial<Section>) => {
    setLocalReviewSection(section.reviewSection || '');
    setLocalMemorizationSection(section.memorizationSection || '');
    setLocalReviewMeta(section.reviewMeta || []);
    setLocalMemorizationMeta(section.memorizationMeta || []);
  }, []);

  // Handle Meta Changes (Structured Data)
  const handleMetaChange = useCallback(
    (
      type: 'memorizationMeta' | 'reviewMeta', 
      segments: QuranSegmentData[], 
      onChange: (e: any) => void
    ) => {
      // 1. Update Local State
      if (type === 'memorizationMeta') {
        setLocalMemorizationMeta(segments);
      } else {
        setLocalReviewMeta(segments);
      }

      // 2. Trigger Parent Change
      onChange({ target: { name: type, value: segments } });
    }, 
    []
  );

  // Debounced input change handler (Legacy Text)
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
    localReviewMeta,
    localMemorizationMeta,
    syncLocalState,
    handleInputChange,
    handleMetaChange,
  };
};
