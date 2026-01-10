import { Modal, Button, DatePicker } from '@/components/UI';
import { memo } from 'react';
import type { EditSectionModalProps } from '../types/types';
import { useEditSectionModal } from '../hooks/modals';
import { useSectionValidation } from '../hooks/useSectionValidation'; 
import QuranSegmentInput from '../components/QuranSegmentInput';
import ErrorMessageList from '../components/ErrorMessageList';

/**
 * Modal for editing an existing section
 * 
 * ✅ V3 Compatible:
 * - Date can be changed (with backend validation)
 * - Backend handles date-aware neighbor validation
 * - UI provides quick consistency feedback
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

  // Frontend Validation (Real-time)
  const { consistencyErrors, hasConsistencyErrors } = useSectionValidation(
      localMemorizationMeta, 
      localReviewMeta
  );

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

  const footerButtons = (
    <div className="flex gap-3 w-full">
      <Button
        type="button"
        onClick={onClose}
        variant="secondary"
        className="flex-1 py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors"
        disabled={isLoading}
      >
        إلغاء التعديل
      </Button>
      <Button
        type="submit"
        form="edit-section-form"
        variant="primary"
        className={`flex-[2] py-3 px-8 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 min-h-[52px] transition-all font-bold text-lg
          ${hasConsistencyErrors 
            ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-400 hover:shadow-none hover:translate-y-0' 
            : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
          }`}
        disabled={isLoading || hasConsistencyErrors}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            جاري التحديث...
          </span>
        ) : (
          'حفظ التغييرات'
        )}
      </Button>
    </div>
  );

  return (
    <Modal 
       isOpen={isOpen} 
       onClose={onClose} 
       title="تعديل المقطع" 
       size="2xl"
       footer={footerButtons}
    >
      <form id="edit-section-form" onSubmit={handleFormSubmit}>
        {/* Date Field Container */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <DatePicker
            label="تاريخ التسميع"
            value={localSection.date}
            onChange={handleDateChange}
            required
          />
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
             ✅ V3: يمكن تغيير التاريخ - النظام سيتحقق من التسلسل الزمني تلقائياً
          </p>
        </div>

        {/* Updated Input Structure */}
        <div className="space-y-6">
          <QuranSegmentInput 
             label="معلومات الحفظ"
             colorClass="amber"
             segments={localMemorizationMeta}
             onChange={(segments) => handleMetaChange('memorizationMeta', segments, onChange)}
             groupName={localSection.group}
             type="memorization"
           />

           <QuranSegmentInput 
             label="معلومات المراجعة"
             colorClass="emerald"
             segments={localReviewMeta}
             onChange={(segments) => handleMetaChange('reviewMeta', segments, onChange)}
             groupName={localSection.group}
             type="review"
           />
        </div>

        {/* Validation Errors */}
        <div className="mt-6">
          <ErrorMessageList errors={consistencyErrors} />
        </div>
      </form>
    </Modal>
  );
};

export const EditSectionModal = memo(EditSectionModalComponent);
