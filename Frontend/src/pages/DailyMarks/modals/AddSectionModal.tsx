import { Modal } from "../../../components/shared/Modal";
import { Button } from "../../../components/shared/Button";
import { Input } from "../../../components/shared/Input";
import { Plus, Calendar, BookOpen, FileText } from "lucide-react";
import type { AddSectionModalProps } from "../types/dailyMarks";

/**
 * Modal for adding a new section
 */
export const AddSectionModal = ({
  isOpen,
  selectedGroup,
  newSection,
  onClose,
  onSubmit,
  onChange,
}: AddSectionModalProps) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إضافة مقطع جديد">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 -mt-6 -mx-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <Plus className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">إضافة مقطع جديد</h3>
        </div>
        <p className="text-white/90 text-sm mt-2">الحلقة: {selectedGroup}</p>
      </div>

      <form onSubmit={onSubmit}>
        {/* Date Field */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-3">
            <Calendar className="h-5 w-5 text-emerald-600" />
            التاريخ
          </label>
          <Input
            type="date"
            id="date"
            name="date"
            value={newSection.date}
            onChange={onChange}
            className="border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
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
            className="border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            required
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
            className="border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
            required
          />
        </div>

        {/* Action buttons */}
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
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            إضافة المقطع
          </Button>
        </div>
      </form>
    </Modal>
  );
};
