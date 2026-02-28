import { memo, useEffect, useState } from "react";
import { Button, Modal, DatePicker } from "@/components/UI";
import type { AddSectionModalProps } from "../types/types";
import { useAddSectionModal } from "../hooks/modals";
import {
  useSectionValidation,
  useAutoValidateSchedule,
} from "../hooks/teacher";
import { useCompletedSurahs } from "../hooks/data";
import QuranSegmentInput from "../components/QuranSegmentInput";
import ErrorMessageList from "../components/ErrorMessageList";
import { checkSectionQuota } from "@/Api/DailyMark/sectionApi";

/**
 * Modal for adding a new section
 * Optimized with local state + debounced parent updates
 *
 * ✅ V3 Compatible:
 * - Backfilling support (can add past dates via backend validation)
 * - UI validation for quick feedback
 * - Backend handles date-aware sequence validation
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
  const {
    // localReviewSection, // Legacy unused
    // localMemorizationSection, // Legacy unused
    localReviewMeta,
    localMemorizationMeta,
    syncLocalState,
    resetLocalState,
    // handleInputChange, // Legacy unused
    handleMetaChange,
  } = useAddSectionModal();

  // Fetch Completed Surahs for Validation
  const { completedList } = useCompletedSurahs(selectedGroup, isOpen);

  // New: Quota Validation State - DISABLED (constraints removed)
  const [quotaError] = useState<string | null>(null);
  const [isCheckingQuota] = useState(false);

  // ✅ FIX: Reset local state when modal closes, sync when opens
  useEffect(() => {
    if (isOpen) {
      // Reset first, then sync with new data
      resetLocalState();
      syncLocalState(newSection);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // Only depend on isOpen to trigger reset/sync on open

  // ✅ FIX: Sync when newSection.date changes (for date picker updates)
  useEffect(() => {
    if (isOpen && newSection) {
      syncLocalState(newSection);
    }
  }, [isOpen, newSection, syncLocalState]);

  // Quota check DISABLED - no restrictions on date/quota

  // Validation errors - DISABLED (constraints removed)
  const [reviewValidationError] = useState<string | null>(null);
  const [memorizationValidationError] = useState<string | null>(null);

  // Auto-adjust review end - DISABLED (constraints removed)

  // All validation DISABLED - no constraints
  const consistencyErrors: string[] = [];
  const isSchedulerValidating = false;
  const scheduleErrors: string[] = [];
  const suggestedAlternatives:
    | { dateKey: string; dayName: string; weekNumber: number }[]
    | null = null;

  const hasErrors = false;
  const allErrors = [
    ...consistencyErrors,
    ...scheduleErrors,
    ...(memorizationValidationError ? [memorizationValidationError] : []),
    ...(reviewValidationError ? [reviewValidationError] : []),
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasErrors) return;

    // Construct the payload with the latest local state
    const payload = {
      ...newSection,
      memorizationMeta: localMemorizationMeta,
      reviewMeta: localReviewMeta,
      memorizationSection: "",
      reviewSection: "",
    };

    onSubmit(e, payload);
  };

  if (!isOpen) return null;

  // ✅ V3: minDate removed - backfilling is allowed
  // Backend performs date-aware validation for chronological integrity
  // UI can accept any valid date format

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
        onMouseDown={(e) => e.preventDefault()} // Prevent blur to avoid layout shift (shake) from dropdown closing
        className={`flex-[2] py-3 px-8 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 min-h-[52px] transition-all font-bold text-lg
          ${
            hasErrors
              ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400 hover:shadow-none hover:translate-y-0"
              : "bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 hover:from-emerald-700 hover:via-teal-800 hover:to-slate-800"
          }`}
        disabled={
          isLoading || hasErrors || isCheckingQuota || isSchedulerValidating
        }
        title={
          hasErrors
            ? "يرجى تصحيح الأخطاء أولاً"
            : isSchedulerValidating
              ? "جاري التحقق..."
              : "إضافة المقطع"
        }>
        {isLoading || isCheckingQuota || isSchedulerValidating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            {isCheckingQuota
              ? "جاري التحقق من الحصة..."
              : isSchedulerValidating
                ? "جاري التحقق من الترتيب..."
                : "جاري الإضافة..."}
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
        {/* Date Field Container */}
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
            // minDate removed - any date allowed
          />
          <div className="mt-2">
            <p className="text-xs text-slate-500 flex items-center gap-1">
              📅 اختر التاريخ المناسب
            </p>
          </div>

          {/* ✅ V10: Loading indicator for quota check */}
          {isCheckingQuota && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-600 text-sm flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span>جاري التحقق من إمكانية الإضافة...</span>
            </div>
          )}
          {/* ✅ V10: Quota Error Display - Enhanced styling matching the toast format */}
          {quotaError && (
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-xl shadow-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">❌</span>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-red-700 bg-yellow-100 px-2 py-0.5 rounded">
                      ⚠️ تنبيه:
                    </span>
                  </div>
                  <p className="text-sm font-bold text-red-800 whitespace-pre-line leading-relaxed">
                    {quotaError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* تحذير التعارض + التاريخ المقترح - DISABLED (constraints removed) */}
        </div>

        {/* Input Sections */}
        <div className="space-y-6">
          <QuranSegmentInput
            label="معلومات الحفظ"
            colorClass="amber"
            segments={localMemorizationMeta}
            onChange={(segments) =>
              handleMetaChange("memorizationMeta", segments, onChange)
            }
            groupName={newSection.group || selectedGroup}
            type="memorization"
            completedSurahs={completedList.filter(
              (s) => (s.type || "memorization") === "memorization",
            )}
            date={
              newSection.date
                ? new Date(newSection.date).toISOString()
                : undefined
            }
            groupId={newSection.group || selectedGroup}
            onValidationError={() => {}}
          />

          <QuranSegmentInput
            label="معلومات المراجعة"
            colorClass="emerald"
            segments={localReviewMeta}
            onChange={(segments) =>
              handleMetaChange("reviewMeta", segments, onChange)
            }
            groupName={newSection.group || selectedGroup}
            type="review"
            completedSurahs={completedList.filter(
              (s) => (s.type || "memorization") === "review",
            )}
            date={
              newSection.date
                ? new Date(newSection.date).toISOString()
                : undefined
            }
            onValidationError={() => {}}
            groupId={newSection.group || selectedGroup}
          />
        </div>

        {/* Validation Errors Area */}
        <div className="mt-6">
          <ErrorMessageList errors={allErrors} />
        </div>
      </form>
    </Modal>
  );
};

export const AddSectionModal = memo(AddSectionModalComponent);
