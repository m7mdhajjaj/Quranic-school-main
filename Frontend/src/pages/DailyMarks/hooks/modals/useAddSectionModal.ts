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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _onChange: (e: any) => void
    ) => {
      // 1. Update Local State
      if (type === 'memorizationMeta') {
        setLocalMemorizationMeta(segments);
      } else {
        setLocalReviewMeta(segments);
      }
      // No parent update on change
    }, 
    []
  );

  const syncWithParent = useCallback((onChange: (e: any) => void) => {
      onChange({ target: { name: 'reviewMeta', value: localReviewMeta } });
      onChange({ target: { name: 'memorizationMeta', value: localMemorizationMeta } });
      // Clear legacy
      onChange({ target: { name: 'reviewSection', value: '' } });
      onChange({ target: { name: 'memorizationSection', value: '' } });
  }, [localReviewMeta, localMemorizationMeta]);


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
    syncWithParent,
  };
};
