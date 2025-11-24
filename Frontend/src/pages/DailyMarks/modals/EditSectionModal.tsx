import { Modal, Button, Input, DatePicker } from '@/components/UI';
import { Edit } from 'lucide-react';
import type { EditSectionModalProps } from '../types/dailyMarks';

/**
 * Modal for editing an existing section
 */
export const EditSectionModal = ({
  isOpen,
  editingSection,
  onClose,
  onSubmit,
  onChange,
}: EditSectionModalProps) => {
  if (!isOpen || !editingSection) return null;

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
            onChange={(date) => {
              const event = {
                target: { name: 'date', value: date },
              } as React.ChangeEvent<HTMLInputElement>;
              onChange(event);
            }}
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
            onChange={onChange}
            className="border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
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
            onChange={onChange}
            className="border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
          />
        </div>

        <div className="flex gap-3 mt-8">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            className="flex-1 py-3 px-6 rounded-xl"
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            حفظ التعديل
          </Button>
        </div>
      </form>
    </Modal>
  );
};
