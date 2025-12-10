import React from "react";
import { Mail, Phone, Users, Loader2, Check, AlertCircle } from "lucide-react";
import type { Group } from "@/Api/groupApi";

interface TeacherFormStep2Props {
  formData: {
    email: string;
    phoneNumber: string;
    groups: Array<{ id: string; name: string; number?: number }>;
  };
  touchedFields: Set<string>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleBlur: (fieldName: string) => void;
  getFieldError: (fieldName: string) => string | undefined;
  availableGroups: Group[];
  loadingGroups: boolean;
  handleGroupsChange: (group: Group) => void;
  checkingDuplicate: Record<string, boolean>;
  isDuplicateError: (fieldName: string) => boolean;
}

const TeacherFormStep2: React.FC<TeacherFormStep2Props> = ({
  formData,
  touchedFields,
  handleChange,
  handleBlur,
  getFieldError,
  availableGroups,
  loadingGroups,
  handleGroupsChange,
  checkingDuplicate,
  isDuplicateError,
}) => {
  const getFieldStatus = (fieldName: string) => {
    if (checkingDuplicate[fieldName]) {
      return (
        <Loader2 className="animate-spin text-emerald-500 w-5 h-5" />
      );
    }
    if (getFieldError(fieldName)) {
      return <AlertCircle className={`w-5 h-5 ${isDuplicateError(fieldName) ? 'text-orange-500' : 'text-red-500'}`} />;
    }
    if (touchedFields.has(fieldName) && formData[fieldName as keyof typeof formData]) {
      return <Check className="text-green-500 w-5 h-5" />;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Contact Information Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-emerald-600" />
          معلومات الاتصال
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              البريد الإلكتروني <span className="text-red-500">*</span>
              <span className="mr-auto">
                {getFieldStatus("email")}
              </span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur("email")}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                getFieldError("email")
                  ? isDuplicateError("email")
                    ? "border-orange-500 focus:ring-orange-500"
                    : "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-emerald-500"
              }`}
              placeholder="example@domain.com"
              dir="ltr"
            />
            {getFieldError("email") && (
              <p className={`text-sm mt-1 ${
                isDuplicateError("email") ? "text-orange-500" : "text-red-500"
              }`}>
                {getFieldError("email")}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              رقم الهاتف <span className="text-red-500">*</span>
              <span className="mr-auto">
                {getFieldStatus("phoneNumber")}
              </span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              onBlur={() => handleBlur("phoneNumber")}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                getFieldError("phoneNumber")
                  ? isDuplicateError("phoneNumber")
                    ? "border-orange-500 focus:ring-orange-500"
                    : "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-emerald-500"
              }`}
              placeholder="05xxxxxxxx"
              dir="rtl"
              maxLength={10}
            />
            {getFieldError("phoneNumber") && (
              <p className={`text-sm mt-1 ${
                isDuplicateError("phoneNumber") ? "text-orange-500" : "text-red-500"
              }`}>
                {getFieldError("phoneNumber")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Groups Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-600" />
          الحلقات التي يدرسها المعلم <span className="text-sm text-gray-500 font-normal">(اختياري)</span>
        </h3>

        {loadingGroups ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <span className="mr-3 text-gray-600">
              جاري تحميل الحلقات...
            </span>
          </div>
        ) : availableGroups.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              لا توجد حلقات متاحة حالياً
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableGroups.map((group) => {
              const isSelected = formData.groups?.some(
                (g) => g.id === group._id
              );

              return (
                <button
                  key={group._id}
                  type="button"
                  onClick={() => handleGroupsChange(group)}
                  className={`group relative p-5 rounded-xl border-2 transition-all duration-300 text-right shadow-sm hover:shadow-md ${
                    isSelected
                      ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-50"
                      : "border-gray-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <span
                        className={`font-semibold text-base block ${
                          isSelected
                            ? "text-emerald-800"
                            : "text-gray-800 group-hover:text-emerald-700"
                        }`}
                      >
                        {group.name}
                      </span>
                      <span className={`text-xs mt-1 block ${
                        isSelected ? "text-emerald-600" : "text-gray-500"
                      }`}>
                        {isSelected ? "محددة - انقر للإلغاء" : "انقر للإضافة"}
                      </span>
                    </div>
                    
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-emerald-500 text-white shadow-lg"
                        : "bg-gray-100 text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-600"
                    }`}>
                      {isSelected ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span className="text-2xl leading-none">+</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {formData.groups && formData.groups.length > 0 && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <p className="text-sm text-emerald-800">
              <strong>الحلقات المختارة ({formData.groups.length}):</strong>{" "}
              {formData.groups.map((g) => g.name).join("، ")}
            </p>
          </div>
        )}
      </div>

      {/* Info Note */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-emerald-800">
            <p className="font-semibold mb-1">ملاحظة:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>يتم التحقق من تكرار البريد الإلكتروني ورقم الهاتف تلقائياً</li>
              <li>اختيار الحلقات اختياري - يمكن للمعلم تدريس أكثر من حلقة واحدة</li>
              <li>جميع الحقول المميزة بـ (*) إلزامية</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherFormStep2;

