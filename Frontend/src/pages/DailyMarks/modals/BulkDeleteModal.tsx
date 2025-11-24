import { Button, Modal, Card } from '@/components/UI';
import { AlertTriangle } from 'lucide-react';
import type { BulkDeleteModalProps } from '../types/dailyMarks';

/**
 * Modal for bulk deleting multiple sections
 */
export const BulkDeleteModal = ({
  isOpen,
  sections,
  selectedSectionsForBulk,
  onClose,
  onToggleSection,
  onConfirm,
}: BulkDeleteModalProps) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="حذف المقاطع لجميع الطلاب">
      <div>
        <div className="mb-6">
          <h4 className="text-md font-bold text-gray-700 mb-4">
            اختر المقاطع المراد حذفها:
          </h4>
          <Card className="max-h-60 overflow-y-auto p-4 bg-gray-50">
            {sections.map((section) => (
              <label
                key={section._id}
                className="flex items-center mb-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-red-50 transition border border-gray-100"
              >
                <input
                  type="checkbox"
                  checked={selectedSectionsForBulk.includes(section._id)}
                  onChange={() => onToggleSection(section._id)}
                  className="ml-3 w-4 h-4 accent-red-600"
                />
                <span className="text-sm text-gray-700">
                  {new Date(section.date).toLocaleDateString('en-GB')} - مراجعة:{' '}
                  {section.reviewSection} - حفظ: {section.memorizationSection}
                </span>
              </label>
            ))}
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-bold mb-1">تحذير هام!</p>
              <p className="text-red-700 text-sm">
                سيتم حذف جميع العلامات المرتبطة بالمقاطع المحددة نهائياً. هذا
                الإجراء لا يمكن التراجع عنه.
              </p>
            </div>
          </div>
        </Card>

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
            type="button"
            onClick={onConfirm}
            variant="danger"
            className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            حذف المقاطع المحددة
          </Button>
        </div>
      </div>
    </Modal>
  );
};
