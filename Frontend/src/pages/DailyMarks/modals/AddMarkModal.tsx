import { Button, RangeSlider, Modal, Card } from "@/components/UI";
import type { AddMarkModalProps } from '../types/types';

/**
 * Modal for adding a new mark for a student
 * 
 * ✅ V3 Compatible:
 * - Works with date-aware sections
 * - Displays section info with proper date formatting
 * - ✅ FIX: Shows only relevant mark sliders based on section content
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

  // ✅ تحديد ما إذا كان المقطع يحتوي على حفظ أو مراجعة
  const hasMemorization = !!(
    selectedSection.memorizationSection?.trim() || 
    (selectedSection.memorizationMeta && selectedSection.memorizationMeta.length > 0)
  );
  const hasReview = !!(
    selectedSection.reviewSection?.trim() || 
    (selectedSection.reviewMeta && selectedSection.reviewMeta.length > 0)
  );

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
          {hasReview && (
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">مقطع المراجعة:</span>{' '}
              {selectedSection.reviewSection}
            </p>
          )}
          {hasMemorization && (
            <p className="text-sm text-gray-600">
              <span className="font-semibold">مقطع الحفظ:</span>{' '}
              {selectedSection.memorizationSection}
            </p>
          )}
        </Card>

        {/* ✅ إظهار slider المراجعة فقط إذا كان هناك مقطع مراجعة */}
        {hasReview && (
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
        )}

        {/* ✅ إظهار slider الحفظ فقط إذا كان هناك مقطع حفظ */}
        {hasMemorization && (
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
        )}

        {/* رسالة تحذيرية إذا لم يكن هناك أي مقطع */}
        {!hasReview && !hasMemorization && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
            ⚠️ هذا المقطع لا يحتوي على حفظ أو مراجعة محددة
          </div>
        )}

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
            disabled={isLoading || (!hasReview && !hasMemorization)}
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
