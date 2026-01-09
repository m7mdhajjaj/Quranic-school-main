import { Modal, Button, DatePicker } from '@/components/UI';
import { memo } from 'react';
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localSection) return;

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
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 py-3 px-8 rounded-xl shadow-lg hover:shadow-xl min-h-[52px]"
            disabled={isLoading}
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
