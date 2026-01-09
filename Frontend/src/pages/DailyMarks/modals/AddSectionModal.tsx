import { memo, useEffect, useMemo } from 'react';
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

  // ==========================================
  // 🛡️ Frontend Validation (Real-time)
  // ==========================================
  const consistencyErrors = useMemo(() => {
    const errors: string[] = [];
    if (!localMemorizationMeta || !localReviewMeta) return errors;

    localReviewMeta.forEach((rev) => {
      const matchingMems = localMemorizationMeta.filter(
        (m) => m.surahNumber === rev.surahNumber
      );
      matchingMems.forEach((mem) => {
        // Rule 1: Memorization starting at 1 cannot have same-surah Review
        if (mem.ayahStart === 1) {
          errors.push(
            `🚫 تنبيه في سورة ${rev.surahNameCanonical}: الحفظ يبدأ من الآية 1، لذا لا يمكن إضافة مراجعة لنفس السورة.`
          );
        }
        // Rule 2: Review must be strictly before Memorization
        else if (rev.ayahEnd >= mem.ayahStart) {
          errors.push(
            `🚫 خطأ في سورة ${rev.surahNameCanonical}: المراجعة (${rev.ayahStart}-${rev.ayahEnd}) تتداخل مع أو تسبق الحفظ (${mem.ayahStart}-${mem.ayahEnd}). يجب أن تكون المراجعة قبل الحفظ.`
          );
        }
      });
    });
    return errors;
  }, [localMemorizationMeta, localReviewMeta]);

  const hasConsistencyErrors = consistencyErrors.length > 0;

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

        {/* Validation Errors Area */}
        {hasConsistencyErrors && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 animate-pulse">
            {consistencyErrors.map((err, idx) => (
              <p key={idx} className="text-sm text-red-600 font-bold mb-1 last:mb-0 flex items-start gap-2">
                <span>⚠️</span>
                {err}
              </p>
            ))}
          </div>
        )}

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
            className={`flex-1 py-3 px-8 rounded-xl shadow-lg hover:shadow-xl min-h-[52px] transition-all
              ${hasConsistencyErrors 
                ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-500' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
              }`}
            disabled={isLoading || hasConsistencyErrors}
            title={hasConsistencyErrors ? 'يرجى تصحيح الأخطاء أولاً' : 'إضافة المقطع'}
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
