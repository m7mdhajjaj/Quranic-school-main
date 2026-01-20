import React, { memo, useCallback } from "react";
import {
  AlertCircle,
  X,
  Loader2,
  Check,
  User,
  School,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";
import { useTeacherForm } from "../hooks/useTeacherForm";
import TeacherFormStep1 from "./TeacherFormStep1";
import TeacherFormStep2 from "./TeacherFormStep2";
import type { Teacher } from "@/Api/teacherApi";
import type { TeacherFormData } from "@/Validation/teacherValidation";

interface Props {
  onClose: () => void;
  onSuccess: (teacherData: Teacher | TeacherFormData) => void;
  teacher?: Teacher;
}

const TeacherForm: React.FC<Props> = memo(({ onClose, onSuccess, teacher }) => {
  const {
    currentStep,
    formData,
    errors,
    touchedFields,
    isSubmitting,
    showSuccess,
    groups,
    loadingGroups,
    checkingDuplicate,
    calculatedAge,
    isStep1Valid,
    isStep2Valid,
    hasRetryableError,
    handleChange,
    handleBlur,
    handleSubmit,
    handleNextStep,
    handlePrevStep,
    getFieldError,
    isDuplicateError,
    handleGroupsChange,
  } = useTeacherForm({ teacher, onSuccess, onClose });

  const isEditMode = !!teacher;

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const steps = [
    { number: 1, title: "المعلومات الشخصية", icon: User },
    { number: 2, title: "الاتصال والحلقات", icon: School },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity z-[9998]"
        onClick={handleClose}
      />

      {/* Modal */}
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl transform transition-all animate-in fade-in zoom-in duration-200 flex flex-col overflow-hidden z-[9999]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Gradient */}
        <div className="relative bg-gradient-to-l from-emerald-600 via-teal-700 to-slate-700 rounded-t-2xl p-4 overflow-hidden flex-shrink-0">
          {/* Decorative circles */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
          
          <div className="relative flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white truncate">
                  {isEditMode ? "تعديل بيانات المعلم" : "إضافة معلم جديد"}
                </h2>
                <p className="text-white/80 text-xs mt-0.5 truncate">
                  {isEditMode 
                    ? `${teacher?.firstName} ${teacher?.lastName}` 
                    : "أدخل بيانات المعلم"}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex-shrink-0"
              title="إغلاق"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Steps indicator */}
          <div className="relative flex items-center justify-center gap-3">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div 
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                    currentStep === step.number
                      ? "bg-white text-emerald-700 shadow-lg"
                      : currentStep > step.number
                      ? "bg-white/30 text-white"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      currentStep === step.number
                        ? "bg-emerald-600 text-white"
                        : currentStep > step.number
                        ? "bg-white text-emerald-600"
                        : "bg-white/20 text-white/80"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <Check size={14} />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span className="font-medium text-xs hidden sm:block">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <ChevronLeft className="w-4 h-4 text-white/40" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Error/Success Messages */}
        {showSuccess && (
          <div className="mx-4 mt-3 bg-green-50 border border-green-200 text-green-800 px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
            <CheckCircle2 className="text-green-600 w-4 h-4" />
            <span className="font-medium">تم حفظ البيانات بنجاح!</span>
          </div>
        )}

        {Object.keys(errors).length > 0 && !showSuccess && (
          <div className={`mx-4 mt-3 px-3 py-2 rounded-lg text-sm ${
            hasRetryableError
              ? "bg-orange-50 border border-orange-200 text-orange-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span className="font-semibold">
                {hasRetryableError ? "يرجى تصحيح البيانات:" : "يرجى إصلاح الأخطاء:"}
              </span>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {currentStep === 1 && (
            <TeacherFormStep1
              formData={formData}
              handleChange={handleChange}
              handleBlur={handleBlur}
              calculatedAge={calculatedAge}
              getFieldError={getFieldError}
              checkingDuplicate={checkingDuplicate}
              isDuplicateError={isDuplicateError}
            />
          )}

          {currentStep === 2 && (
            <TeacherFormStep2
              formData={formData}
              touchedFields={touchedFields}
              handleChange={handleChange}
              handleBlur={handleBlur}
              getFieldError={getFieldError}
              availableGroups={groups}
              loadingGroups={loadingGroups}
              handleGroupsChange={handleGroupsChange}
              checkingDuplicate={checkingDuplicate}
              isDuplicateError={isDuplicateError}
            />
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-white flex-shrink-0">
          <div className="text-xs text-gray-500">
            الخطوة {currentStep} من {steps.length}
          </div>

          <div className="flex gap-2">
            {currentStep === 2 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium text-sm flex items-center gap-1"
              >
                <ChevronRight className="w-4 h-4" />
                رجوع
              </button>
            )}

            {currentStep === 1 ? (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!isStep1Valid}
                className="px-4 py-2 text-white bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 hover:from-emerald-700 hover:via-teal-800 hover:to-slate-800 rounded-lg transition-all disabled:opacity-50 font-medium text-sm flex items-center gap-1 shadow-lg shadow-emerald-500/25"
              >
                التالي
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting || !isStep2Valid}
                className="px-4 py-2 text-white bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 hover:from-emerald-700 hover:via-teal-800 hover:to-slate-800 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-500/25 font-medium text-sm"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    {isEditMode ? "حفظ التغييرات" : "إضافة المعلم"}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

TeacherForm.displayName = "TeacherForm";

export default TeacherForm;
