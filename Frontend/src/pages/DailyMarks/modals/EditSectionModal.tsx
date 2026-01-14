import { Modal, Button, DatePicker } from '@/components/UI';
import { memo, useState, useEffect, useCallback } from 'react';
import type { EditSectionModalProps } from '../types/types';
import { useEditSectionModal } from '../hooks/modals';
import { useSectionValidation } from '../hooks/useSectionValidation'; 
import { useCompletedSurahs } from '../hooks/useCompletedSurahs';
import { useAutoValidateSchedule } from '../hooks/useSchedulerValidation';
import QuranSegmentInput from '../components/QuranSegmentInput';
import ErrorMessageList from '../components/ErrorMessageList';
import { checkSectionQuota } from '@/Api/DailyMark/sectionApi';

/**
 * Modal for editing an existing section
 * 
 * ✅ V3 Compatible:
 * - Date can be changed (with backend validation)
 * - Backend handles date-aware neighbor validation
 * - UI provides quick consistency feedback
 */
const EditSectionModalComponent = ({
  isOpen,
  editingSection,
  isLoading,
  onClose,
  onSubmit,
  onChange,
}: EditSectionModalProps) => {
  const { 
    localSection,
    localReviewMeta,
    localMemorizationMeta, 
    handleDateChange, 
    handleMetaChange,
    syncWithParent 
  } = useEditSectionModal(editingSection);

  // Fetch Completed Surahs for Validation
  const { completedList } = useCompletedSurahs(localSection?.group || "", isOpen);

  // New: Quota Validation State
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const [isCheckingQuota, setIsCheckingQuota] = useState(false);

  // New: Check Quota on Date Change
  useEffect(() => {
    if (!isOpen || !localSection?.date || !localSection?.group || !localSection?._id) return;
    
    // Only check if date actually changed from original, OR regardless? 
    // Always checking is safer if rules changed, but let's debounce.
    
    // Note: If date is same as original, backend returns true (valid).
    
    const timer = setTimeout(async () => {
        setIsCheckingQuota(true);
        // Pass ID to exclude itself from count
        const result = await checkSectionQuota(localSection.group, localSection.date, localSection._id); 
        setIsCheckingQuota(false);
        
        if (!result.allowed) {
            setQuotaError(result.message || "لا يمكن التعديل لهذا التاريخ");
        } else {
            setQuotaError(null);
        }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSection?.date, localSection?.group, localSection?._id, isOpen]);


  // Frontend Validation (Real-time)
  const { consistencyErrors, hasConsistencyErrors } = useSectionValidation(
      localMemorizationMeta, 
      localReviewMeta
  );

  // 🆕 V6: Smart Scheduler Validation (Monotonic Order)
  const {
    isValidating: isSchedulerValidating,
    allValid: isScheduleValid,
    validationErrors: scheduleErrors,
    suggestedAlternative,
  } = useAutoValidateSchedule(
    localSection?.group,
    localMemorizationMeta.filter(m => m.surahNumber && m.ayahStart && m.ayahEnd),
    localSection?.date,
    600 // 600ms debounce
  );

  const hasErrors = hasConsistencyErrors || !!quotaError || !isScheduleValid;
  const allErrors = [
    ...consistencyErrors,
    ...scheduleErrors,
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localSection) return;
    
    // Safety check just in case
    if (hasErrors) return;

    // Construct the payload with the latest local state
    const payload = {
      ...localSection,
      memorizationMeta: localMemorizationMeta,
      reviewMeta: localReviewMeta,
      // Ensure legacy fields if needed, or null them if using meta
      // For now we keep legacy fields as is or empty if not used
    };

    // Sync with parent before submit (optional if we pass payload)
    syncWithParent(onChange);
    
    // Pass event AND payload
    onSubmit(e, payload);
  };

  if (!isOpen || !editingSection || !localSection) return null;

  const footerButtons = (
    <div className="flex gap-3 w-full">
      <Button
        type="button"
        onClick={onClose}
        variant="secondary"
        className="flex-1 py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors"
        disabled={isLoading}
      >
        إلغاء التعديل
      </Button>
      <Button
        type="submit"
        form="edit-section-form"
        variant="primary"
        onMouseDown={(e) => e.preventDefault()} // Prevent blur to avoid layout shift from dropdown closing
        className={`flex-[2] py-3 px-8 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 min-h-[52px] transition-all font-bold text-lg
          ${hasErrors 
            ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-400 hover:shadow-none hover:translate-y-0' 
            : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
          }`}
        disabled={isLoading || hasErrors || isCheckingQuota || isSchedulerValidating}
        title={hasErrors ? 'يرجى تصحيح الأخطاء أولاً' : isSchedulerValidating ? 'جاري التحقق...' : 'حفظ التغييرات'}
      >
        {isLoading || isCheckingQuota || isSchedulerValidating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            {isCheckingQuota ? 'جاري التحقق من الحصة...' : isSchedulerValidating ? 'جاري التحقق من الترتيب...' : 'جاري التحديث...'}
          </span>
        ) : (
          'حفظ التغييرات'
        )}
      </Button>
    </div>
  );

  return (
    <Modal 
       isOpen={isOpen} 
       onClose={onClose} 
       title="تعديل المقطع" 
       size="2xl"
       footer={footerButtons}
    >
      <form id="edit-section-form" onSubmit={handleFormSubmit}>
        {/* Date Field Container */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <DatePicker
            label="تاريخ التسميع"
            value={localSection.date}
            onChange={handleDateChange}
            required
          />
          <div className="mt-2">
            <p className="text-xs text-slate-500 flex items-center gap-1">
               ✅ V3: يمكن تغيير التاريخ - النظام سيتحقق من التسلسل الزمني تلقائياً
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
                          let dateValue = suggestedAlternative.dateKey;
                          if (!dateValue && suggestedAlternative.date) {
                            dateValue = typeof suggestedAlternative.date === 'string' 
                              ? suggestedAlternative.date.split('T')[0] 
                              : new Date(suggestedAlternative.date).toISOString().split('T')[0];
                          }
                          if (dateValue) {
                            handleDateChange(dateValue);
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

        {/* Updated Input Structure */}
        <div className="space-y-6">
          <QuranSegmentInput 
             label="معلومات الحفظ"
             colorClass="amber"
             segments={localMemorizationMeta}
             onChange={(segments) => handleMetaChange('memorizationMeta', segments, onChange)}
             groupName={localSection.group}
             type="memorization"
             excludeId={localSection._id}
             completedSurahs={completedList.filter(s => (s.type || 'memorization') === 'memorization')}
           />

           <QuranSegmentInput 
             label="معلومات المراجعة"
             colorClass="emerald"
             segments={localReviewMeta}
             onChange={(segments) => handleMetaChange('reviewMeta', segments, onChange)}
             groupName={localSection.group}
             type="review"
             excludeId={localSection._id}
             completedSurahs={completedList.filter(s => (s.type || 'memorization') === 'review')}
           />
        </div>

        {/* Validation Errors */}
        <div className="mt-6">
          <ErrorMessageList errors={allErrors} />
        </div>
      </form>
    </Modal>
  );
};

export const EditSectionModal = memo(EditSectionModalComponent);
