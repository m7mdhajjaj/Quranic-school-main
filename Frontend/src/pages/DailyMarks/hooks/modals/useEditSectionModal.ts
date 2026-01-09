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
      onChange: (e: any) => void
    ) => {
      // 1. Update Local State
      if (type === 'memorizationMeta') {
        setLocalMemorizationMeta(segments);
      } else {
        setLocalReviewMeta(segments);
      }

      // 2. Trigger Parent Change (Update the main state object too)
      // This mimics the event object for compatibility with the existing onChange handler
      onChange({ target: { name: type, value: segments } });
      
      // Also update localSection to reflect changes immediately in UI if needed
       setLocalSection((prev) => (prev ? { ...prev, [type]: segments } : null));
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
