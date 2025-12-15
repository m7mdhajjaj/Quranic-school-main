import { memo, useEffect } from 'react';
import {
  Button,
  Input,
  Modal,
  DatePicker,
} from '@/components/UI';
import { BookOpen, FileText } from 'lucide-react';
import type { AddSectionModalProps } from '../types/types';
import { useAddSectionModal } from '../hooks/modals';

/**
 * Modal for adding a new section
 * Optimized with local state + debounced parent updates for 60+ fps typing
 */
const AddSectionModalComponent = ({
  isOpen,
  newSection,
  isLoading = false,
  onClose,
  onSubmit,
  onChange,
}: AddSectionModalProps) => {
  const {
    localReviewSection,
    localMemorizationSection,
    syncLocalState,
    handleInputChange,
  } = useAddSectionModal();

  // Sync with parent state when modal opens
  useEffect(() => {
    if (isOpen) {
      syncLocalState(newSection);
    }
  }, [isOpen, newSection.reviewSection, newSection.memorizationSection]);

  if (!isOpen) return null;

  // Get today's date in YYYY-MM-DD format for minDate
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إضافة مقطع جديد">
      {/* Gradient Header */}

      <form onSubmit={onSubmit}>
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
            value={localReviewSection}
            onChange={(e) => handleInputChange(e.target.name, e.target.value, onChange)}
            autoComplete="off"
            spellCheck={false}
            inputMode="text"
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
            value={localMemorizationSection}
            onChange={(e) => handleInputChange(e.target.name, e.target.value, onChange)}
            autoComplete="off"
            spellCheck={false}
            inputMode="text"
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
            className="flex-1 py-3 px-6 rounded-xl min-h-[52px]"
          >
            <span className="block">إلغاء</span>
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 py-3 px-8 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed min-h-[52px]"
          >
            <span className="block">
              {isLoading ? 'جاري الإضافة...' : 'إضافة المقطع'}
            </span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Remove custom comparison - let React handle it naturally
// The modal should re-render when newSection changes (that's the point)
export const AddSectionModal = memo(AddSectionModalComponent);
