import { memo, useEffect, useState } from 'react';
import {
  Button,
  Modal,
  DatePicker,
} from '@/components/UI';
import type { AddSectionModalProps } from '../types/types';
import { useAddSectionModal } from '../hooks/modals';
import { useSectionValidation } from '../hooks/useSectionValidation'; 
import { useCompletedSurahs } from '../hooks/useCompletedSurahs';
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

  const hasErrors = hasConsistencyErrors || !!quotaError;

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
        disabled={isLoading || hasErrors || isCheckingQuota}
        title={hasErrors ? 'يرجى تصحيح الأخطاء أولاً' : 'إضافة المقطع'}
      >
        {isLoading || isCheckingQuota ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            {isCheckingQuota ? 'جاري التحقق...' : 'جاري الإضافة...'}
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
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
             📅 يمكنك اختيار التاريخ من اليوم وما بعده فقط
          </p>
          
          {/* Quota Error Display */}
          {quotaError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2 animate-pulse">
                  <span className="font-bold">⚠️ تنبيه:</span>
                  <span className="whitespace-pre-line">{quotaError}</span>
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
          <ErrorMessageList errors={consistencyErrors} />
        </div>
      </form>
    </Modal>
  );
};

export const AddSectionModal = memo(AddSectionModalComponent);
