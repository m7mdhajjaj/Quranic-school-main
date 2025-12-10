import React from "react";
import {
  AlertCircle,
  X,
  Loader2,
  Check,
  User,
  School,
  ChevronLeft,
} from "lucide-react";
import { useDisableBodyScroll } from "@/hooks/useDisableBodyScroll";
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

const TeacherForm: React.FC<Props> = ({ onClose, onSuccess, teacher }) => {
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

  // منع scroll الصفحة عند فتح المودل
  useDisableBodyScroll(true);

  const steps = [
    { number: 1, title: "المعلومات الشخصية", icon: User },
    { number: 2, title: "الاتصال والحلقات", icon: School },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 will-change-opacity"
      dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col relative z-[10000] will-change-transform gpu-accelerate">
        <div className="p-6 border-b bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <User className="text-emerald-600" size={28} />
                {teacher ? "تعديل بيانات المعلم" : "إضافة معلم جديد"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {teacher
                  ? "قم بتحديث معلومات المعلم"
                  : "أدخل بيانات المعلم الكاملة"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
              aria-label="إغلاق">
              <X size={24} />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                      currentStep === step.number
                        ? "bg-emerald-600 text-white shadow-lg"
                        : currentStep > step.number
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        currentStep === step.number
                          ? "bg-white text-emerald-600"
                          : currentStep > step.number
                          ? "bg-green-600 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}>
                      {currentStep > step.number ? (
                        <Check size={18} />
                      ) : (
                        <step.icon size={18} />
                      )}
                    </div>
                    <span className="font-semibold text-sm hidden sm:block">
                      {step.title}
                    </span>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ChevronLeft
                    className={`${
                      currentStep > step.number
                        ? "text-green-600"
                        : "text-gray-300"
                    }`}
                    size={20}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {showSuccess && (
          <div className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2 animate-fadeIn">
            <Check className="text-green-600" size={20} />
            <span className="font-medium">تم حفظ البيانات بنجاح!</span>
          </div>
        )}

        {Object.keys(errors).length > 0 && !showSuccess && (
          <div
            className={`mx-6 mt-4 px-4 py-3 rounded-lg animate-fadeIn ${
              hasRetryableError
                ? "bg-orange-50 border border-orange-200 text-orange-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={20} />
              <span className="font-semibold">
                {hasRetryableError
                  ? "يرجى تصحيح البيانات والمحاولة مرة أخرى:"
                  : "يرجى إصلاح الأخطاء التالية:"}
              </span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm ml-6">
              {Object.entries(errors).map(([field, message]) => (
                <li key={field}>{message}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
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

        {/* Footer - الأزرار */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {currentStep === 1 ? (
                isStep1Valid ? (
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <Check size={16} />
                    جميع حقول الخطوة الأولى مكتملة
                  </span>
                ) : (
                  <span className="text-gray-500">
                    يرجى ملء جميع الحقول المطلوبة
                  </span>
                )
              ) : isStep2Valid ? (
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <Check size={16} />
                  جميع حقول الخطوة الثانية مكتملة
                </span>
              ) : (
                <span className="text-gray-500">
                  يرجى ملء جميع الحقول المطلوبة
                </span>
              )}
            </div>

            <div className="flex gap-3">
              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium flex items-center gap-2">
                  رجوع
                </button>
              )}

              {currentStep === 1 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!isStep1Valid}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 shadow-lg shadow-emerald-500/30">
                  التالي
                </button>
              ) : (
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isStep2Valid}
                  className={`px-6 py-2.5 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 shadow-lg ${
                    hasRetryableError
                      ? "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-orange-500/30"
                      : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-green-500/30"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      {teacher ? "تحديث البيانات" : "حفظ البيانات"}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherForm;
