import { memo, useEffect } from 'react';
import {
  Button,
  Modal,
  DatePicker,
} from '@/components/UI';
import type { AddSectionModalProps } from '../types/types';
import { useAddSectionModal } from '../hooks/modals';
import QuranSegmentInput from '../components/QuranSegmentInput';

/**
 * Modal for adding a new section
 * Optimized with local state + debounced parent updates for 60+ fps typing
 */
const AddSectionModalComponent = ({
  isOpen,
  newSection,
  selectedGroup,
  isLoading = false,
  onClose,
  onSubmit,
  onChange,
}: AddSectionModalProps) => {
  const {
    localReviewSection,
    localMemorizationSection,
    localReviewMeta,
    localMemorizationMeta,
    syncLocalState,
    handleInputChange,
    handleMetaChange,
  } = useAddSectionModal();

  // Sync with parent state when modal opens
  useEffect(() => {
    if (isOpen) {
      syncLocalState(newSection);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Get today's date in YYYY-MM-DD format for minDate
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إضافة مقطع جديد">
      {/* Gradient Header */}

      <form onSubmit={onSubmit} className="max-h-[80vh] overflow-y-auto px-1">
        {/* Date Field */}
        <div className="mb-6">
          <DatePicker
            label="التاريخ"
            value={newSection.date}
            onChange={(date) =>
              onChange({
                target: { name: 'date', value: date },
              } as React.ChangeEvent<HTMLInputElement>)
            }
            minDate={minDate}
            required
          />
          <p className="mt-2 text-xs text-gray-500">
            * يجب أن يكون التاريخ من اليوم أو في المستقبل
          </p>
        </div>

        {/* Memorization Section (First) */}
        <div className="mb-6">
            <QuranSegmentInput 
             label="معلومات الحفظ"
             colorClass="amber"
             segments={localMemorizationMeta}
             onChange={(segments) => handleMetaChange('memorizationMeta', segments, onChange)}
             groupName={newSection.group || selectedGroup}
             type="memorization"
           />
        </div>

        {/* Review Section (Second) */}
        <div className="mb-6">
           <QuranSegmentInput 
             label="معلومات المراجعة"
             colorClass="emerald"
             segments={localReviewMeta}
             onChange={(segments) => handleMetaChange('reviewMeta', segments, onChange)}
             groupName={newSection.group || selectedGroup}
             type="review"
           />
        </div>

        <div className="flex gap-3 mt-8">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            className="flex-1 py-3 px-6 rounded-xl"
            disabled={isLoading}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 py-3 px-8 rounded-xl shadow-lg hover:shadow-xl min-h-[52px]"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                جاري الإضافة...
              </span>
            ) : (
              'إضافة المقطع'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export const AddSectionModal = memo(AddSectionModalComponent);
