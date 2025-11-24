import { memo, useCallback, useRef, useState, useEffect } from 'react';
import {
  Button,
  Input,
  Modal,
  DatePicker,
  LoadingSpinner,
} from '@/components/UI';
import { BookOpen, FileText } from 'lucide-react';
import type { AddSectionModalProps } from '../types/dailyMarks';

/**
 * Modal for adding a new section
 * Optimized with local state + debounced parent updates for 60+ fps typing
 */
const AddSectionModalComponent = ({
  isOpen,
  newSection,
  isLoading = false,
  onClose,
  onSubmit,
  onChange,
}: AddSectionModalProps) => {
  // Local controlled state for instant UI updates (no parent re-render)
  const [localReviewSection, setLocalReviewSection] = useState('');
  const [localMemorizationSection, setLocalMemorizationSection] = useState('');
  
  // Debounce timer ref
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Sync with parent state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalReviewSection(newSection.reviewSection);
      setLocalMemorizationSection(newSection.memorizationSection);
    }
  }, [isOpen, newSection.reviewSection, newSection.memorizationSection]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Debounced onChange - updates parent ONLY after 300ms of no typing
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Update local state immediately for 0ms input lag
    if (name === 'reviewSection') {
      setLocalReviewSection(value);
    } else if (name === 'memorizationSection') {
      setLocalMemorizationSection(value);
    }

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce parent state update (300ms delay prevents re-render storm)
    debounceTimer.current = setTimeout(() => {
      onChange(e); // Only trigger heavy parent re-render after user stops typing
      debounceTimer.current = null;
    }, 300);
  }, [onChange]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إضافة مقطع جديد">
      {/* Gradient Header */}

      <form onSubmit={onSubmit}>
        {/* Date Field */}
        <div className="mb-6">
          <DatePicker
            label="التاريخ"
            value={newSection.date}
            onChange={(date) => onChange({ target: { name: 'date', value: date } } as React.ChangeEvent<HTMLInputElement>)}
            required
          />
        </div>

        {/* Review Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-emerald-200">
            <BookOpen className="h-5 w-5 text-emerald-600" />
            <h4 className="text-md font-bold text-emerald-700">
              معلومات المراجعة
            </h4>
          </div>
          <Input
            type="text"
            id="reviewSection"
            name="reviewSection"
            label="مقطع المراجعة"
            placeholder="مثال: البقرة (1-10)"
            value={localReviewSection}
            onChange={handleInputChange}
            autoComplete="off"
            spellCheck={false}
            inputMode="text"
            className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-100"
          />
        </div>

        {/* Memorization Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-amber-200">
            <FileText className="h-5 w-5 text-amber-600" />
            <h4 className="text-md font-bold text-amber-600">معلومات الحفظ</h4>
          </div>
          <Input
            type="text"
            id="memorizationSection"
            name="memorizationSection"
            label="مقطع الحفظ"
            placeholder="مثال: البقرة (11-15)"
            value={localMemorizationSection}
            onChange={handleInputChange}
            autoComplete="off"
            spellCheck={false}
            inputMode="text"
            className="border-gray-200 focus:border-amber-500 focus:ring-amber-100"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-8">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            disabled={isLoading}
            className="flex-1 py-3 px-6 rounded-xl"
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 py-3 px-8 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" color="emerald" showIcon={false} />
                <span>جاري الإضافة...</span>
              </div>
            ) : (
              'إضافة المقطع'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Remove custom comparison - let React handle it naturally
// The modal should re-render when newSection changes (that's the point)
export const AddSectionModal = memo(AddSectionModalComponent);
