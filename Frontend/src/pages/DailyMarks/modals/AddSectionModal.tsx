import { memo, useEffect, useState, useCallback } from 'react';
import {
  Button,
  Modal,
  DatePicker,
} from '@/components/UI';
import type { AddSectionModalProps } from '../types/types';
import { useAddSectionModal } from '../hooks/modals';
import { useSectionValidation } from '../hooks/useSectionValidation'; 
import { useCompletedSurahs } from '../hooks/useCompletedSurahs';
import { useAutoValidateSchedule } from '../hooks/useSchedulerValidation';
import QuranSegmentInput from '../components/QuranSegmentInput';
import ErrorMessageList from '../components/ErrorMessageList';
import { checkSectionQuota } from '@/Api/DailyMark/sectionApi';

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
    // handleInputChange, // Legacy unused
    handleMetaChange,
  } = useAddSectionModal();

  // Fetch Completed Surahs for Validation
  const { completedList } = useCompletedSurahs(selectedGroup, isOpen);

  // New: Quota Validation State
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const [isCheckingQuota, setIsCheckingQuota] = useState(false);

  // Sync with parent state when modal opens
  useEffect(() => {
    if (isOpen) {
      syncLocalState(newSection);
      setQuotaError(null); // Reset error on open
    }
  }, [isOpen, newSection, syncLocalState]);

  // New: Check Quota on Date Change
  useEffect(() => {
    if (!isOpen || !newSection.date) return;
    
    const grp = newSection.group || selectedGroup;
    if (!grp) return;

    const timer = setTimeout(async () => {
        setIsCheckingQuota(true);
        // excludeId is undefined for Add mode
        const result = await checkSectionQuota(grp, newSection.date); 
        setIsCheckingQuota(false);
        
        if (!result.allowed) {
            setQuotaError(result.message || "لا يمكن الإضافة في هذا التاريخ");
        } else {
            setQuotaError(null);
        }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [newSection.date, selectedGroup, newSection.group, isOpen]);

  // Frontend Validation
  const { consistencyErrors, hasConsistencyErrors } = useSectionValidation(
      localMemorizationMeta, 
      localReviewMeta
  );

  // 🆕 V5: Smart Scheduler Validation (Monotonic Order)
  const {
    isValidating: isSchedulerValidating,
    allValid: isScheduleValid,
    validationErrors: scheduleErrors,
    suggestedAlternative,
  } = useAutoValidateSchedule(
    newSection.group || selectedGroup,
    localMemorizationMeta.filter(m => m.surahNumber && m.ayahStart && m.ayahEnd),
    newSection.date,
    600 // 600ms debounce
  );

  const hasErrors = hasConsistencyErrors || !!quotaError || !isScheduleValid;
  const allErrors = [
    ...consistencyErrors,
    ...scheduleErrors,
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
      reviewSection: ""
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
        disabled={isLoading}
      >
        إلغاء
      </Button>
      <Button
        type="submit"
        form="add-section-form"
        variant="primary"
        onMouseDown={(e) => e.preventDefault()} // Prevent blur to avoid layout shift (shake) from dropdown closing
        className={`flex-[2] py-3 px-8 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 min-h-[52px] transition-all font-bold text-lg
          ${hasErrors 
            ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-400 hover:shadow-none hover:translate-y-0' 
            : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
          }`}
        disabled={isLoading || hasErrors || isCheckingQuota || isSchedulerValidating}
        title={hasErrors ? 'يرجى تصحيح الأخطاء أولاً' : isSchedulerValidating ? 'جاري التحقق...' : 'إضافة المقطع'}
      >
        {isLoading || isCheckingQuota || isSchedulerValidating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            {isCheckingQuota ? 'جاري التحقق من الحصة...' : isSchedulerValidating ? 'جاري التحقق من الترتيب...' : 'جاري الإضافة...'}
          </span>
        ) : (
          'حفظ وإضافة'
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
       footer={footerButtons}
    >
      <form id="add-section-form" onSubmit={handleFormSubmit}>
        
        {/* Date Field Container */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <DatePicker
            label="تاريخ التسميع"
            value={newSection.date}
            onChange={(date) =>
              onChange({
                target: { name: 'date', value: date },
              } as React.ChangeEvent<HTMLInputElement>)
            }
            required
            minDate={new Date().toISOString().split('T')[0]}
          />
          <div className="mt-2">
            <p className="text-xs text-slate-500 flex items-center gap-1">
               📅 يمكنك اختيار التاريخ من اليوم وما بعده فقط
            </p>
          </div>
          
          {/* Quota Error Display */}
          {quotaError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2 animate-pulse">
                  <span className="font-bold">⚠️ تنبيه:</span>
                  <span className="whitespace-pre-line">{quotaError}</span>
              </div>
          )}

          {/* 🆕 Schedule Validation Error + Alternative Suggestion */}
          {!isScheduleValid && scheduleErrors.length > 0 && (
            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg text-orange-800 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-lg">🔒</span>
                <div className="flex-1">
                  <p className="font-bold mb-1">تعارض في ترتيب التواريخ:</p>
                  {scheduleErrors.map((err, i) => (
                    <p key={i} className="text-xs whitespace-pre-line">{err}</p>
                  ))}
                  
                  {/* Suggested Alternative Date */}
                  {suggestedAlternative && (suggestedAlternative.dateKey || suggestedAlternative.date) && (
                    <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <p className="text-emerald-700 text-xs font-medium">
                        💡 تاريخ مقترح: <strong>{suggestedAlternative.dateKey || (typeof suggestedAlternative.date === 'string' ? suggestedAlternative.date : new Date(suggestedAlternative.date).toISOString().split('T')[0])}</strong>
                      </p>
                      <p className="text-emerald-600 text-xs">{suggestedAlternative.reason}</p>
                      <button
                        type="button"
                        onClick={() => {
                          // Safely extract date string in YYYY-MM-DD format
                          let dateValue = suggestedAlternative.dateKey;
                          if (!dateValue && suggestedAlternative.date) {
                            dateValue = typeof suggestedAlternative.date === 'string' 
                              ? suggestedAlternative.date.split('T')[0] 
                              : new Date(suggestedAlternative.date).toISOString().split('T')[0];
                          }
                          if (dateValue) {
                            onChange({
                              target: { name: 'date', value: dateValue },
                            } as React.ChangeEvent<HTMLInputElement>);
                          }
                        }}
                        className="mt-1 px-3 py-1 bg-emerald-500 text-white text-xs rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        استخدام هذا التاريخ
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Scheduler Validating Indicator */}
          {isSchedulerValidating && (
            <div className="mt-2 flex items-center gap-2 text-blue-600 text-xs">
              <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></span>
              جاري التحقق من صلاحية الترتيب...
            </div>
          )}
        </div>

        {/* Input Sections */}
        <div className="space-y-6">
          <QuranSegmentInput 
             label="معلومات الحفظ"
             colorClass="amber"
             segments={localMemorizationMeta}
             onChange={(segments) => handleMetaChange('memorizationMeta', segments, onChange)}
             groupName={newSection.group || selectedGroup}
             type="memorization"
             completedSurahs={completedList.filter(s => (s.type || 'memorization') === 'memorization')}
           />

           <QuranSegmentInput 
             label="معلومات المراجعة"
             colorClass="emerald"
             segments={localReviewMeta}
             onChange={(segments) => handleMetaChange('reviewMeta', segments, onChange)}
             groupName={newSection.group || selectedGroup}
             type="review"
             completedSurahs={completedList.filter(s => (s.type || 'memorization') === 'review')}
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
