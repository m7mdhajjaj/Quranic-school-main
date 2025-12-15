import { Modal, Button, Input, DatePicker } from '@/components/UI';
import { memo } from 'react';
import type { EditSectionModalProps } from '../types/types';
import { useEditSectionModal } from '../hooks/modals';

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
  const { localSection, handleDateChange, handleInputChange, syncWithParent } =
    useEditSectionModal(editingSection);

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
      

      <form onSubmit={handleFormSubmit}>
        <div className="mb-6">
          <DatePicker
            label="التاريخ"
            value={localSection.date}
            onChange={handleDateChange}
            required
          />
        </div>

        <div className="mb-6">
          <Input
            type="text"
            id="edit-reviewSection"
            name="reviewSection"
            label="مقطع المراجعة"
            placeholder="مثال: البقرة (1-10)"
            value={localSection.reviewSection}
            onChange={handleInputChange}
            className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-100"
          />
        </div>

        <div className="mb-6">
          <Input
            type="text"
            id="edit-memorizationSection"
            name="memorizationSection"
            label="مقطع الحفظ"
            placeholder="مثال: البقرة (11-15)"
            value={localSection.memorizationSection}
            onChange={handleInputChange}
            className="border-gray-200 focus:border-amber-500 focus:ring-amber-100"
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
