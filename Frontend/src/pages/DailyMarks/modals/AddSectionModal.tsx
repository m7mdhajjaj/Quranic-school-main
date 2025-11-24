import { memo } from 'react';
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
 */
const AddSectionModalComponent = ({
  isOpen,
  newSection,
  isLoading = false,
  onClose,
  onSubmit,
  onChange,
}: AddSectionModalProps) => {
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
            value={newSection.reviewSection}
            onChange={onChange}
            autoComplete="off"
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
            value={newSection.memorizationSection}
            onChange={onChange}
            autoComplete="off"
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

export const AddSectionModal = memo(AddSectionModalComponent, (prev, next) => {
  // Only re-render if these specific props change
  return (
    prev.isOpen === next.isOpen &&
    prev.isLoading === next.isLoading &&
    prev.newSection.date === next.newSection.date &&
    prev.newSection.reviewSection === next.newSection.reviewSection &&
    prev.newSection.memorizationSection === next.newSection.memorizationSection
  );
});
