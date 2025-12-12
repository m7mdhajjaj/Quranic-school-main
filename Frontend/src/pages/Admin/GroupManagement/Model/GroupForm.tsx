import React, { useEffect } from "react";
import {
  AlertCircle,
  X,
  Loader2,
  Check,
  Users,
  Calendar,
  ChevronLeft,
} from "lucide-react";
import { useGroupForm } from "../hooks/useGroupForm";
import type { Group } from "@/Api/groupApi";
import type { GroupFormData } from "@/Validation/groupValidation";
import GroupFormStep1 from "./GroupFormStep1";

interface Props {
  onClose: () => void;
  onSuccess: (groupData: Group | GroupFormData) => void;
  group?: Group;
}

const AddGroupForm: React.FC<Props> = ({
  onClose,
  onSuccess,
  group,
}) => {
  const {
    formData,
    errors,
    isSubmitting,
    showSuccess,
    teachers,
    loadingTeachers,
    checkingDuplicate,
    isFormValid,
    handleChange,
    handleBlur,
    handleSubmit,
    getFieldError,
    isDuplicateError,
  } = useGroupForm({
    group,
    onSuccess,
    onClose,
  });

  // منع scroll الصفحة عند فتح المودل
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 will-change-opacity"
      dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col relative z-[10000] will-change-transform gpu-accelerate">
        <div className="p-6 border-b bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="text-emerald-600" size={28} />
                {group ? "تعديل بيانات الحلقة" : "إضافة حلقة جديدة"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {group
                  ? "قم بتحديث معلومات الحلقة"
                  : "أدخل بيانات الحلقة الكاملة"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
              aria-label="إغلاق">
              <X size={24} />
            </button>
          </div>
        </div>

        {showSuccess && (
          <div className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2 animate-fadeIn">
            <Check className="text-green-600" size={20} />
            <span className="font-medium">تم حفظ البيانات بنجاح!</span>
          </div>
        )}

        {Object.keys(errors).length > 0 && !showSuccess && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-lg animate-fadeIn bg-red-50 border border-red-200 text-red-700">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={20} />
              <span className="font-semibold">
                يرجى إصلاح الأخطاء التالية:
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
          <GroupFormStep1
            formData={formData}
            handleChange={handleChange}
            handleBlur={handleBlur}
            getFieldError={getFieldError}
            isDuplicateError={isDuplicateError}
            checkingDuplicate={checkingDuplicate}
            teachers={teachers}
            loadingTeachers={loadingTeachers}
          />
        </div>

        {/* Footer - الأزرار */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {isFormValid ? (
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <Check size={16} />
                  جميع الحقول المطلوبة مكتملة
                </span>
              ) : (
                <span className="text-gray-500">
                  يرجى ملء جميع الحقول المطلوبة (الاسم والمعلم)
                </span>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium">
                إلغاء
              </button>
              
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting || !isFormValid}
                className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-green-500/30 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 shadow-lg">
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    {group ? "تحديث البيانات" : "حفظ البيانات"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddGroupForm;

