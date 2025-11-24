import { Modal, Button, Input, DatePicker } from '@/components/UI';
import { Edit } from 'lucide-react';
import { useCallback } from 'react';
import type { EditSectionModalProps } from '../types/types';

import { memo } from 'react';

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
  if (!isOpen || !editingSection) return null;

  const handleDateChange = useCallback((date: string) => {
    const event = {
      target: { name: 'date', value: date },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
  }, [onChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
  }, [onChange]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تعديل المقطع">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 -mt-6 -mx-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <Edit className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">تعديل المقطع</h3>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <div className="mb-6">
          <DatePicker
            label="التاريخ"
            value={editingSection.date}
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
            value={editingSection.reviewSection}
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
            value={editingSection.memorizationSection}
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
