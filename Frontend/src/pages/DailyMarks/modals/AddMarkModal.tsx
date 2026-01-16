import { Button, RangeSlider, Modal, Card } from "@/components/UI";
import type { AddMarkModalProps } from '../types/types';

/**
 * Modal for adding a new mark for a student
 * 
 * ✅ V3 Compatible:
 * - Works with date-aware sections
 * - Displays section info with proper date formatting
 */
export const AddMarkModal = ({
  isOpen,
  selectedSection,
  selectedStudent,
  newMark,
  isLoading = false,
  onClose,
  onSubmit,
  onChange,
}: AddMarkModalProps) => {
  if (!isOpen || !selectedSection || !selectedStudent) return null;

  const handleReviewMarkChange = (value: number) => {
    onChange({
      target: { name: 'reviewMark', value: value.toString() },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleMemorizationMarkChange = (value: number) => {
    onChange({
      target: { name: 'memorizationMark', value: value.toString() },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`إضافة علامة للطالب: ${selectedStudent.firstName} ${selectedStudent.fatherName} ${selectedStudent.lastName}`}
    >
      <form onSubmit={onSubmit}>
        <Card className="bg-gray-50 mb-6">
          <h4 className="font-bold text-gray-700 mb-2">معلومات المقطع:</h4>
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-semibold">التاريخ:</span>{' '}
            {new Date(selectedSection.date).toLocaleDateString('en-GB', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              timeZone: 'Asia/Jerusalem'
            })}
          </p>
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-semibold">مقطع المراجعة:</span>{' '}
            {selectedSection.reviewSection}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">مقطع الحفظ:</span>{' '}
            {selectedSection.memorizationSection}
          </p>
        </Card>

        <div className="mb-6">
          <RangeSlider
            label="علامة المراجعة (6-10)"
            min={6}
            max={10}
            step={0.5}
            value={newMark.reviewMark}
            onChange={handleReviewMarkChange}
            showValue={true}
            color="emerald"
          />
        </div>

        <div className="mb-6">
          <RangeSlider
            label="علامة الحفظ (6-10)"
            min={6}
            max={10}
            step={0.5}
            value={newMark.memorizationMark}
            onChange={handleMemorizationMarkChange}
            showValue={true}
            color="emerald"
          />
        </div>

        <div className="flex gap-3 mt-8">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            disabled={isLoading}
            className="flex-1 py-3 px-6 rounded-xl min-h-[52px]"
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            loading={isLoading}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 py-3 px-8 rounded-xl min-h-[52px] shadow-md hover:shadow-lg"
          >
            {isLoading ? 'جاري الإضافة...' : 'إضافة العلامات'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
