import { useState, useCallback, useEffect } from 'react';
import type { Section } from '../../types/types';

export const useEditSectionModal = (editingSection: Section | null) => {
  const [localSection, setLocalSection] = useState<Section | null>(editingSection);

  // Sync local state when modal opens or section changes
  useEffect(() => {
    if (editingSection) {
      setLocalSection(editingSection);
    }
  }, [editingSection]);

  const handleDateChange = useCallback((date: string) => {
    setLocalSection((prev) => (prev ? { ...prev, date } : null));
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalSection((prev) => (prev ? { ...prev, [name]: value } : null));
  }, []);

  const syncWithParent = useCallback(
    (onChange: (e: React.ChangeEvent<HTMLInputElement>) => void) => {
      if (!localSection) return;

      const fields: Array<'date' | 'reviewSection' | 'memorizationSection'> = [
        'date',
        'reviewSection',
        'memorizationSection',
      ];
      
      fields.forEach((field) => {
        onChange({
          target: { name: field, value: localSection[field] },
        } as React.ChangeEvent<HTMLInputElement>);
      });
    },
    [localSection]
  );

  return {
    localSection,
    handleDateChange,
    handleInputChange,
    syncWithParent,
  };
};
