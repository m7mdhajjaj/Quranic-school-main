import { useState, useCallback, useRef, useEffect } from 'react';
import type { Section, QuranSegmentUI } from '../../types/types';

const INPUT_DEBOUNCE = 10; // ms

export const useAddSectionModal = () => {
  const [localReviewSection, setLocalReviewSection] = useState('');
  const [localMemorizationSection, setLocalMemorizationSection] = useState('');
  
  // New Structured State
  const [localReviewMeta, setLocalReviewMeta] = useState<QuranSegmentUI[]>([]);
  const [localMemorizationMeta, setLocalMemorizationMeta] = useState<QuranSegmentUI[]>([]);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Sync local state with external section
  const syncLocalState = useCallback((section: Partial<Section>) => {
    setLocalReviewSection(section.reviewSection || '');
    setLocalMemorizationSection(section.memorizationSection || '');
    setLocalReviewMeta((section.reviewMeta || []) as QuranSegmentUI[]);
    setLocalMemorizationMeta((section.memorizationMeta || []) as QuranSegmentUI[]);
  }, []);

  // Handle Meta Changes (Structured Data)
  const handleMetaChange = useCallback(
    (
      type: 'memorizationMeta' | 'reviewMeta', 
      segments: QuranSegmentUI[], 
      onChange: (e: any) => void
    ) => {
      // 1. Update Local State
      if (type === 'memorizationMeta') {
        setLocalMemorizationMeta(segments);
      } else {
        setLocalReviewMeta(segments);
      }

      // 2. Trigger Parent Change (Strip error before sending to parent/backend if needed, but keeping it for now is fine as backend ignores extra fields usually)
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
