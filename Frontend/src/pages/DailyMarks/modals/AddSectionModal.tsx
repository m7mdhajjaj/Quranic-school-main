import { memo, useEffect, useState } from 'react';
import {
  Button,
  Modal,
  DatePicker,
} from '@/components/UI';
import type { AddSectionModalProps } from '../types/types';
import { useAddSectionModal } from '../hooks/modals';
import { useSectionValidation, useAutoValidateSchedule } from '../hooks/teacher';
import { useCompletedSurahs } from '../hooks/data';
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
    resetLocalState,
    // handleInputChange, // Legacy unused
    handleMetaChange,
  } = useAddSectionModal();

  // Fetch Completed Surahs for Validation
  const { completedList } = useCompletedSurahs(selectedGroup, isOpen);

  // New: Quota Validation State (includes week check from backend)
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const [isCheckingQuota, setIsCheckingQuota] = useState(false);

  // ✅ FIX: Reset local state when modal closes, sync when opens
  useEffect(() => {
    if (isOpen) {
      // Reset first, then sync with new data
      resetLocalState();
      syncLocalState(newSection);
      setQuotaError(null); // Reset error on open
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // Only depend on isOpen to trigger reset/sync on open

  // ✅ FIX: Sync when newSection.date changes (for date picker updates)
  useEffect(() => {
    if (isOpen && newSection) {
      syncLocalState(newSection);
    }
  }, [isOpen, newSection, syncLocalState]);

  // New: Check Quota on Date Change (Backend handles week check too)
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

  // ✅ V8: Review validation error (no memorization)
  const [reviewValidationError, setReviewValidationError] = useState<string | null>(null);
  // ✅ V13: Memorization validation error (Active Surah)
  const [memorizationValidationError, setMemorizationValidationError] = useState<string | null>(null);

  // ✅ V9: Auto-adjust review end when same surah memorization exists
  // Rule: If memorization starts at X, review can only go up to X-1
  useEffect(() => {
    if (localReviewMeta.length === 0 || localMemorizationMeta.length === 0) return;
    
    const reviewSeg = localReviewMeta[0];
    const memSeg = localMemorizationMeta[0];
    
    // Check if same surah
    if (reviewSeg?.surahNumber && memSeg?.surahNumber && reviewSeg.surahNumber === memSeg.surahNumber) {
      // If memorization starts from 1, review shouldn't exist for this surah (first time memorizing)
      if (memSeg.ayahStart === 1) {
        // Clear review - can't review a surah being memorized for the first time
        handleMetaChange('reviewMeta', [], onChange);
        return;
      }
      
      // If review end >= memorization start, adjust it
      if (reviewSeg.ayahEnd && memSeg.ayahStart && reviewSeg.ayahEnd >= memSeg.ayahStart) {
        const adjustedEnd = memSeg.ayahStart - 1;
        if (adjustedEnd >= 1) {
          const adjustedReview = { ...reviewSeg, ayahEnd: adjustedEnd };
          handleMetaChange('reviewMeta', [adjustedReview], onChange);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localMemorizationMeta]);

  // ✅ V8: Backend Real-time Validation
  const { consistencyErrors, hasConsistencyErrors, isValidating: isValidatingSegments } = useSectionValidation(
      localMemorizationMeta, 
      localReviewMeta,
      {
        groupName: newSection.group || selectedGroup,
        date: newSection.date
      }
  );

  // 🆕 V8: Smart Scheduler Validation (Monotonic Order) with multiple alternatives
  const {
    isValidating: isSchedulerValidating,
    allValid: isScheduleValid,
    validationErrors: scheduleErrors,
    suggestedAlternatives,
    suggestedAlternative,
  } = useAutoValidateSchedule(
    newSection.group || selectedGroup,
    localMemorizationMeta.filter(m => m.surahNumber && m.ayahStart && m.ayahEnd),
    newSection.date,
    600 // 600ms debounce
  );

  const hasErrors = hasConsistencyErrors || !!quotaError || !isScheduleValid || !!reviewValidationError || !!memorizationValidationError;
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
            : 'bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 hover:from-emerald-700 hover:via-teal-800 hover:to-slate-800'
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
                      <span className="text-sm font-bold text-red-700 bg-yellow-100 px-2 py-0.5 rounded">⚠️ تنبيه:</span>
                    </div>
                    <p className="text-sm font-bold text-red-800 whitespace-pre-line leading-relaxed">{quotaError}</p>
                  </div>
                </div>
              </div>
          )}

          {/* تحذير التعارض + التاريخ المقترح */}
          {!isScheduleValid && scheduleErrors.length > 0 && (
            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-lg">🔒</span>
                <div className="flex-1">
                  <p className="font-bold text-orange-800 mb-1">تعارض في ترتيب التواريخ:</p>
                  {scheduleErrors.map((err, i) => (
                    <p key={i} className="text-orange-700 text-xs whitespace-pre-line">{err}</p>
                  ))}
                </div>
              </div>
                  
              {/* التاريخ المقترح */}
              {suggestedAlternatives && suggestedAlternatives.length > 0 && (
                <div className="mt-3 pt-3 border-t border-orange-200">
                  <p className="text-emerald-700 text-xs font-medium mb-2">💡 تواريخ مقترحة:</p>
                  <button
                    type="button"
                    onClick={() => {
                      onChange({
                        target: { name: 'date', value: suggestedAlternatives[0].dateKey },
                      } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    className="w-full px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all shadow-sm"
                  >
                    <span className="font-bold text-sm">{suggestedAlternatives[0].dateKey}</span>
                    <span className="block text-xs mt-1 opacity-90">{suggestedAlternatives[0].dayName} - أسبوع {suggestedAlternatives[0].weekNumber}</span>
                  </button>
                </div>
              )}
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
             date={newSection.date ? new Date(newSection.date).toISOString() : undefined}
             groupId={newSection.group || selectedGroup}
             onValidationError={setMemorizationValidationError}
           />

           <QuranSegmentInput 
             label="معلومات المراجعة"
             colorClass="emerald"
             segments={localReviewMeta}
             onChange={(segments) => handleMetaChange('reviewMeta', segments, onChange)}
             groupName={newSection.group || selectedGroup}
             type="review"
             completedSurahs={completedList.filter(s => (s.type || 'memorization') === 'review')}
             date={newSection.date ? new Date(newSection.date).toISOString() : undefined}
             onValidationError={setReviewValidationError}
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
