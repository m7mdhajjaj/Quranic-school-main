import { Modal } from "../../../components/shared/Modal";
import { Button } from "../../../components/shared/Button";
import { Input } from "../../../components/shared/Input";
import { Card } from "../../../components/shared/Card";
import { RefreshCw } from "lucide-react";
import type { BulkUpdateModalProps } from "../types/dailyMarks";

/**
 * Modal for bulk updating multiple sections
 */
export const BulkUpdateModal = ({
  isOpen,
  sections,
  selectedSectionsForBulk,
  onClose,
  onToggleSection,
  onSubmit,
}: BulkUpdateModalProps) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const updateData = {
      reviewSection:
        (formData.get("reviewSection") as string) || undefined,
      memorizationSection:
        (formData.get("memorizationSection") as string) || undefined,
    };
    onSubmit(updateData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تحديث المقاطع لجميع الطلاب">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 -mt-6 -mx-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <RefreshCw className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">
            تحديث المقاطع لجميع الطلاب
          </h3>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <h4 className="text-md font-bold text-gray-700 mb-4">
            اختر المقاطع المراد تحديثها:
          </h4>
          <Card className="max-h-60 overflow-y-auto p-4 bg-gray-50">
            {sections.map((section) => (
              <label
                key={section._id}
                className="flex items-center mb-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-purple-50 transition border border-gray-100"
              >
                <input
                  type="checkbox"
                  checked={selectedSectionsForBulk.includes(section._id)}
                  onChange={() => onToggleSection(section._id)}
                  className="ml-3 w-4 h-4 accent-purple-600"
                />
                <span className="text-sm text-gray-700">
                  {new Date(section.date).toLocaleDateString("en-GB")} -
                  مراجعة: {section.reviewSection} - حفظ:{" "}
                  {section.memorizationSection}
                </span>
              </label>
            ))}
          </Card>
        </div>

        <div className="mb-6">
          <Input
            type="text"
            name="reviewSection"
            label="مقطع المراجعة الجديد (اتركه فارغاً للاحتفاظ بالقيمة الحالية)"
            placeholder="مثال: البقرة (1-10)"
            className="border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
        </div>

        <div className="mb-6">
          <Input
            type="text"
            name="memorizationSection"
            label="مقطع الحفظ الجديد (اتركه فارغاً للاحتفاظ بالقيمة الحالية)"
            placeholder="مثال: البقرة (11-15)"
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
            className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            تحديث المقاطع المحددة
          </Button>
        </div>
      </form>
    </Modal>
  );
};
