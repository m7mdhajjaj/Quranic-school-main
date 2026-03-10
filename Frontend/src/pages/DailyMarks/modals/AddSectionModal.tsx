import { memo, useEffect, useState } from "react";
import { Button, Modal, DatePicker } from "@/components/UI";
import type { AddSectionModalProps } from "../types/types";
import { BookOpen, X } from "lucide-react";

/**
 * Modal for adding a new section
 * Simple: just free text inputs for memorization and review
 */
const AddSectionModalComponent = ({
  isOpen,
  newSection,
  selectedGroup,
  isLoading = false,
  onClose,
  onSubmit,
  onChange,
}: AddSectionModalProps) => {
  const [memorizationText, setMemorizationText] = useState("");
  const [reviewText, setReviewText] = useState("");

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setMemorizationText(newSection.memorizationSection || "");
      setReviewText(newSection.reviewSection || "");
    }
  }, [isOpen, newSection.memorizationSection, newSection.reviewSection]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...newSection,
      memorizationSection: memorizationText.trim(),
      reviewSection: reviewText.trim(),
      memorizationMeta: [],
      reviewMeta: [],
    };

    onSubmit(e, payload);
  };

  if (!isOpen) return null;

  const footerButtons = (
    <div className="flex gap-3 w-full">
      <Button
        type="button"
        onClick={onClose}
        variant="secondary"
        className="flex-1 py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors"
        disabled={isLoading}>
        إلغاء
      </Button>
      <Button
        type="submit"
        form="add-section-form"
        variant="primary"
        onMouseDown={(e) => e.preventDefault()}
        className="flex-[2] py-3 px-8 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 min-h-[52px] transition-all font-bold text-lg bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 hover:from-emerald-700 hover:via-teal-800 hover:to-slate-800"
        disabled={isLoading}>
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            جاري الإضافة...
          </span>
        ) : (
          "حفظ وإضافة"
        )}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="إضافة مقطع جديد"
      size="2xl"
      footer={footerButtons}>
      <form id="add-section-form" onSubmit={handleFormSubmit}>
        {/* Date Field */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <DatePicker
            label="تاريخ التسميع"
            value={newSection.date}
            onChange={(date) =>
              onChange({
                target: { name: "date", value: date },
              } as React.ChangeEvent<HTMLInputElement>)
            }
            required
          />
        </div>

        {/* Input Sections */}
        <div className="space-y-6">
          {/* Memorization */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 transition-colors">
                  <BookOpen className="h-4 w-4 text-amber-700" />
                </div>
                <h4 className="text-base font-bold text-gray-800">الحفظ</h4>
              </div>
              {memorizationText && (
                <button
                  type="button"
                  onClick={() => setMemorizationText("")}
                  className="group p-1.5 rounded-full hover:bg-red-50 transition-all duration-200"
                  title="مسح">
                  <X className="h-4 w-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                </button>
              )}
            </div>
            <div className="p-4 rounded-xl border bg-gray-50/50 border-gray-100">
              <input
                type="text"
                autoComplete="off"
                className="w-full rounded-xl border text-sm py-2.5 px-3 transition-all duration-200 outline-none border-gray-100 bg-white hover:border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                placeholder="اكتب الحفظ هنا... مثال: البقرة من آية 1 إلى 5"
                value={memorizationText}
                onChange={(e) => setMemorizationText(e.target.value)}
              />
            </div>
          </div>

          {/* Review */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 transition-colors">
                  <BookOpen className="h-4 w-4 text-emerald-700" />
                </div>
                <h4 className="text-base font-bold text-gray-800">المراجعة</h4>
              </div>
              {reviewText && (
                <button
                  type="button"
                  onClick={() => setReviewText("")}
                  className="group p-1.5 rounded-full hover:bg-red-50 transition-all duration-200"
                  title="مسح">
                  <X className="h-4 w-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                </button>
              )}
            </div>
            <div className="p-4 rounded-xl border bg-gray-50/50 border-gray-100">
              <input
                type="text"
                autoComplete="off"
                className="w-full rounded-xl border text-sm py-2.5 px-3 transition-all duration-200 outline-none border-gray-100 bg-white hover:border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="اكتب المراجعة هنا... مثال: آل عمران من آية 10 إلى 20"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export const AddSectionModal = memo(AddSectionModalComponent);
