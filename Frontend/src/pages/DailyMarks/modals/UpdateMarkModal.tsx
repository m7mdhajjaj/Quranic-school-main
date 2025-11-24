import { Modal, Card, Button, RangeSlider } from '@/components/UI';
import type { UpdateMarkModalProps } from '../types/types';

/**
 * Modal for updating an existing mark
 */
export const UpdateMarkModal = ({
  isOpen,
  selectedSection,
  selectedStudent,
  editingMark,
  newMark,
  isLoading,
  onClose,
  onSubmit,
  onChange,
}: UpdateMarkModalProps) => {
  if (!isOpen || !selectedSection || !selectedStudent || !editingMark)
    return null;

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
      title={`تحديث علامة الطالب: ${selectedStudent.firstName} ${selectedStudent.fatherName} ${selectedStudent.lastName}`}
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
            color="blue"
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
            color="blue"
          />
        </div>

        <div className="flex justify-between mt-8">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            className="py-2 px-6"
            disabled={isLoading}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="bg-blue-600 hover:bg-blue-700 py-2 px-8"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                جاري التحديث...
              </span>
            ) : (
              'تحديث العلامات'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
