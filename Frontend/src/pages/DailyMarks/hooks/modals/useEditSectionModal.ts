import { useState, useCallback, useEffect } from 'react';
import type { Section, QuranSegmentUI } from '../../types/types';

export const useEditSectionModal = (editingSection: Section | null) => {
  const [localSection, setLocalSection] = useState<Section | null>(editingSection);

  // New Structured State
  const [localReviewMeta, setLocalReviewMeta] = useState<QuranSegmentUI[]>([]);
  const [localMemorizationMeta, setLocalMemorizationMeta] = useState<QuranSegmentUI[]>([]);

  // Sync local state when modal opens or section changes
  useEffect(() => {
    if (editingSection) {
      setLocalSection(editingSection);
      setLocalReviewMeta((editingSection.reviewMeta || []) as QuranSegmentUI[]);
      setLocalMemorizationMeta((editingSection.memorizationMeta || []) as QuranSegmentUI[]);
    }
  }, [editingSection]);

  const handleDateChange = useCallback((date: string) => {
    setLocalSection((prev) => (prev ? { ...prev, date } : null));
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
        // Also update localSection and CLEAR legacy string to ensure consistency
        setLocalSection((prev) => (prev ? { ...prev, memorizationMeta: segments, memorizationSection: '' } : null));
      } else {
        setLocalReviewMeta(segments);
        // Also update localSection and CLEAR legacy string to ensure consistency
        setLocalSection((prev) => (prev ? { ...prev, reviewMeta: segments, reviewSection: '' } : null));
      }
    }, 
    []
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalSection((prev) => (prev ? { ...prev, [name]: value } : null));
  }, []);

  const syncWithParent = useCallback(
    (onChange: (e: any) => void) => {
      if (!localSection) return;

      // Send all fields explicitly
      onChange({ target: { name: 'date', value: localSection.date } });
      onChange({ target: { name: 'reviewMeta', value: localReviewMeta } });
      onChange({ target: { name: 'memorizationMeta', value: localMemorizationMeta } });
      
      // We can also send legacy strings if needed, or let backend generate them
      // But clearing them ensures we use Meta
      onChange({ target: { name: 'reviewSection', value: '' } }); 
      onChange({ target: { name: 'memorizationSection', value: '' } });
    },
    [localSection, localReviewMeta, localMemorizationMeta]
  );

  return {
    localSection,
    localReviewMeta,
    localMemorizationMeta,
    handleDateChange,
    handleMetaChange,
    handleInputChange,
    syncWithParent,
  };
};
