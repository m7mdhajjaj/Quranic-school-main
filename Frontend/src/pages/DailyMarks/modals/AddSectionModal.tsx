import { memo, useEffect } from 'react';
import {
  Button,
  Modal,
  DatePicker,
} from '@/components/UI';
import type { AddSectionModalProps } from '../types/types';
import { useAddSectionModal } from '../hooks/modals';
import { useSectionValidation } from '../hooks/useSectionValidation'; 
import QuranSegmentInput from '../components/QuranSegmentInput';
import ErrorMessageList from '../components/ErrorMessageList';

/**
 * Modal for adding a new section
 * Optimized with local state + debounced parent updates
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
    // localReviewSection, // Legacy unused
    // localMemorizationSection, // Legacy unused
    localReviewMeta,
    localMemorizationMeta,
    syncLocalState,
    // handleInputChange, // Legacy unused
    handleMetaChange,
  } = useAddSectionModal();

  // Sync with parent state when modal opens
  useEffect(() => {
    if (isOpen) {
      syncLocalState(newSection);
    }
  }, [isOpen, newSection, syncLocalState]);

  // Frontend Validation
  const { consistencyErrors, hasConsistencyErrors } = useSectionValidation(
      localMemorizationMeta, 
      localReviewMeta
  );

  if (!isOpen) return null;

  // Get today's date in YYYY-MM-DD format for minDate
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إضافة مقطع جديد" size="2xl">
      <form onSubmit={onSubmit}>
        
        {/* Date Field Container */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <DatePicker
            label="تاريخ التسميع"
            value={newSection.date}
            onChange={(date) =>
              onChange({
                target: { name: 'date', value: date },
              } as React.ChangeEvent<HTMLInputElement>)
            }
            minDate={minDate}
            required
          />
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
             📅 يجب أن يكون التاريخ من اليوم أو في المستقبل
          </p>
        </div>

        {/* Input Sections */}
        <div className="space-y-6">
          <QuranSegmentInput 
             label="معلومات الحفظ"
             colorClass="amber"
             segments={localMemorizationMeta}
             onChange={(segments) => handleMetaChange('memorizationMeta', segments, onChange)}
             groupName={newSection.group || selectedGroup}
             type="memorization"
           />

           <QuranSegmentInput 
             label="معلومات المراجعة"
             colorClass="emerald"
             segments={localReviewMeta}
             onChange={(segments) => handleMetaChange('reviewMeta', segments, onChange)}
             groupName={newSection.group || selectedGroup}
             type="review"
           />
        </div>

        {/* Validation Errors Area */}
        <div className="mt-6">
          <ErrorMessageList errors={consistencyErrors} />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            className="flex-1 py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="primary"
            className={`flex-[2] py-3 px-8 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 min-h-[52px] transition-all font-bold text-lg
              ${hasConsistencyErrors 
                ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-400 hover:shadow-none hover:translate-y-0' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
              }`}
            disabled={isLoading || hasConsistencyErrors}
            title={hasConsistencyErrors ? 'يرجى تصحيح الأخطاء أولاً' : 'إضافة المقطع'}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                جاري الإضافة...
              </span>
            ) : (
              'حفظ وإضافة'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export const AddSectionModal = memo(AddSectionModalComponent);
