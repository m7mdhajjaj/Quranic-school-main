import { Modal, Button, DatePicker } from '@/components/UI';
import { memo, useMemo } from 'react';
import type { EditSectionModalProps } from '../types/types';
import { useEditSectionModal } from '../hooks/modals';
import QuranSegmentInput from '../components/QuranSegmentInput';

/**
 * Modal for editing an existing section
 */
const EditSectionModalComponent = ({
  isOpen,
  editingSection,
  isLoading,
  onClose,
  onSubmit,
  onChange,
}: EditSectionModalProps) => {
  const { 
    localSection,
    localReviewMeta,
    localMemorizationMeta, 
    handleDateChange, 
    handleMetaChange,
    syncWithParent 
  } = useEditSectionModal(editingSection);

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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localSection) return;
    
    // Safety check just in case
    if (hasConsistencyErrors) return;

    // Sync with parent before submit
    syncWithParent(onChange);
    onSubmit(e);
  };

  if (!isOpen || !editingSection || !localSection) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تعديل المقطع">
      

      <form onSubmit={handleFormSubmit} className="max-h-[80vh] overflow-y-auto px-1">
        <div className="mb-6">
          <DatePicker
            label="التاريخ"
            value={localSection.date}
            onChange={handleDateChange}
            required
          />
        </div>

        {/* Memorization Section - Upgraded to Structured Input */}
        <div className="mb-6">
            <QuranSegmentInput 
             label="معلومات الحفظ"
             colorClass="amber"
             segments={localMemorizationMeta}
             onChange={(segments) => handleMetaChange('memorizationMeta', segments, onChange)}
             groupName={localSection.group}
             type="memorization"
           />
        </div>

        {/* Review Section - Upgraded to Structured Input */}
        <div className="mb-6">
           <QuranSegmentInput 
             label="معلومات المراجعة"
             colorClass="emerald"
             segments={localReviewMeta}
             onChange={(segments) => handleMetaChange('reviewMeta', segments, onChange)}
             groupName={localSection.group}
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
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
              }`}
            disabled={isLoading || hasConsistencyErrors}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                جاري التحديث...
              </span>
            ) : (
              'حفظ التعديل'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export const EditSectionModal = memo(EditSectionModalComponent);
