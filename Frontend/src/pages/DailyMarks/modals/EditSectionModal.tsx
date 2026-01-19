import { Modal, Button, DatePicker } from '@/components/UI';
import { memo, useState, useEffect } from 'react';
import type { EditSectionModalProps } from '../types/types';
import { useEditSectionModal } from '../hooks/modals';
import { useSectionValidation } from '../hooks/teacher';
import { useCompletedSurahs } from '../hooks/data';
import QuranSegmentInput from '../components/QuranSegmentInput';
import ErrorMessageList from '../components/ErrorMessageList';
import { checkSectionQuota } from '@/Api/DailyMark/sectionApi';

/**
 * Modal for editing an existing section
 * 
 * ✅ V7 Compatible:
 * - Date can be changed (with backend validation)
 * - Backend handles date-aware neighbor validation
 * - UI provides quick consistency feedback
 * - Real-time review validation in QuranSegmentInput
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

  // Quota Validation State (includes week check from backend)
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const [reviewValidationError, setReviewValidationError] = useState<string | null>(null);
  const [isCheckingQuota, setIsCheckingQuota] = useState(false);

  // Check Quota on Date Change (Backend handles week check too)
  useEffect(() => {
    if (!isOpen || !localSection?.date || !localSection?.group || !localSection?._id) return;
    
    const timer = setTimeout(async () => {
        setIsCheckingQuota(true);
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

  // ✅ V8: hasErrors checks quota (which includes week check from backend)
  const hasErrors = hasConsistencyErrors || !!quotaError || !!reviewValidationError;
  const allErrors = [...consistencyErrors];
  
  if (reviewValidationError) {
    allErrors.push(reviewValidationError);
  }

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

    // 🔍 LOG: طباعة البيانات قبل الإرسال
    console.log('📤 [EditSectionModal] Submitting update:');
    console.log('   - Section ID:', localSection._id);
    console.log('   - Date:', localSection.date);
    console.log('   - Group:', localSection.group);
    console.log('   - MemorizationMeta:', JSON.stringify(localMemorizationMeta));
    console.log('   - ReviewMeta:', JSON.stringify(localReviewMeta));
    console.log('   - Full Payload:', JSON.stringify(payload, null, 2));

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
        disabled={isLoading || hasErrors || isCheckingQuota}
        title={hasErrors ? 'يرجى تصحيح الأخطاء أولاً' : 'حفظ التغييرات'}
      >
        {isLoading || isCheckingQuota ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            {isCheckingQuota ? 'جاري التحقق من الحصة...' : 'جاري التحديث...'}
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

          {/* Quota Error Display */}
          {quotaError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2 animate-pulse">
                  <span className="font-bold">⚠️ تنبيه:</span>
                  <span className="whitespace-pre-line">{quotaError}</span>
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
             date={localSection.date ? new Date(localSection.date).toISOString() : undefined}
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
             date={localSection.date ? new Date(localSection.date).toISOString() : undefined}
             onValidationError={setReviewValidationError}
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
