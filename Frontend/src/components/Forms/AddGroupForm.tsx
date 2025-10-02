import React, { useState, useEffect, useCallback, useMemo } from "react";
import { AlertCircle, Users, User, FileText, Hash, Clock, Loader2, Check, X } from "lucide-react";
import { 
  validateGroupFieldWithYup, 
  validateGroupComprehensive,
  type GroupFormData 
} from "../../Validation/groupValidation";
import { getAllTeachers, type Teacher } from "../../Api/teacherApi";
import { getAllGroups, createGroup, updateGroup, type Group } from "../../Api/groupApi";

interface AddGroupFormProps {
  onClose: () => void;
  onSuccess: (groupData?: GroupFormData) => void;
  group?: Group | null;
}

const AddGroupForm: React.FC<AddGroupFormProps> = ({
  onClose,
  onSuccess,
  group,
}) => {
  // Form state
  const [formData, setFormData] = useState<GroupFormData>({
    name: group?.name || "",
    teacher: group?.teacher || "",
    description: group?.description || "",
    capacity: group?.capacity || 20,
    schedule: group?.schedule || "",
    isActive: group?.isActive !== undefined ? group.isActive : true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Data loading states
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [existingGroups, setExistingGroups] = useState<Group[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);



  // Fetch teachers on component mount
  useEffect(() => {
    const fetchTeachers = async () => {
      setLoadingTeachers(true);
      try {
        const result = await getAllTeachers();
        if (result.success && result.data) {
          setTeachers(result.data);
        }
      } catch (error) {
        console.error('Error fetching teachers:', error);
      } finally {
        setLoadingTeachers(false);
      }
    };

    const fetchGroups = async () => {
      try {
        const result = await getAllGroups();
        if (result.success && result.data) {
          setExistingGroups(result.data);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    fetchTeachers();
    fetchGroups();
  }, []);

  // Field validation function
  const validateField = useCallback(async (name: string, value: unknown) => {
    const error = await validateGroupFieldWithYup(name, value, formData as unknown as Record<string, unknown>, !group);
    return error;
  }, [formData, group]);

  // Get field error helper
  const getFieldError = useCallback((fieldName: string) => {
    return touchedFields.has(fieldName) ? errors[fieldName] : '';
  }, [errors, touchedFields]);

  // Handle input change
  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    let processedValue: string | number = value;
    
    if (name === 'capacity') {
      processedValue = value === '' ? 20 : parseInt(value) || 20;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  // Handle field blur
  const handleBlur = useCallback(async (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
    
    const fieldValue = formData[fieldName as keyof GroupFormData];
    const error = await validateField(fieldName, fieldValue);
    
    if (error) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: error,
      }));
    }
  }, [formData, validateField]);

  // Form validation
  const isFormValid = useMemo(() => {
    const requiredFields = ['name', 'teacher'];
    const hasRequiredFields = requiredFields.every(
      field => formData[field as keyof GroupFormData]?.toString().trim()
    );
    const hasNoErrors = Object.keys(errors).length === 0;
    return hasRequiredFields && hasNoErrors;
  }, [formData, errors]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Comprehensive validation including business rules
      const validation = await validateGroupComprehensive(
        formData, 
        existingGroups, 
        !group
      );
      
      if (!validation.isValid) {
        setErrors(validation.errors);
        setIsSubmitting(false);
        return;
      }
      
      // Submit data
      let result;
      if (group && group._id) {
        result = await updateGroup(group._id, formData);
      } else {
        result = await createGroup(formData);
      }
      
      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => {
          onSuccess(result.data);
          onClose();
        }, 1000);
      } else {
        setErrors({ submit: result.message || 'حدث خطأ أثناء حفظ البيانات' });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'حدث خطأ غير متوقع' });
    } finally {
      setIsSubmitting(false);
    }
  }, [isFormValid, isSubmitting, formData, existingGroups, group, onSuccess, onClose]);

  // Show success message
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 mx-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="text-green-600" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {group ? "تم تعديل الحلقة بنجاح!" : "تم إنشاء الحلقة بنجاح!"}
          </h3>
          <p className="text-gray-600">جاري إعادة توجيهك...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="text-blue-600" size={20} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {group ? "تعديل بيانات الحلقة" : "إضافة حلقة جديدة"}
            </h2>
          </div>
          <button
            onClick={onClose}
            title="إغلاق النموذج"
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Error Messages */}
        {(errors.submit || Object.keys(errors).length > 0) && (
          <div className="p-6 border-b border-gray-200">
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle size={18} />
                  <span className="font-medium">خطأ في الحفظ</span>
                </div>
                <p className="text-red-600 mt-1">{errors.submit}</p>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
              <Hash className="text-blue-600" size={20} />
              المعلومات الأساسية
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Group Name */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                  <FileText size={14} className="text-gray-500" />
                  اسم الحلقة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={() => handleBlur('name')}
                  placeholder="مثال: حلقة القرآن الأولى"
                  className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-right ${
                    getFieldError('name')
                      ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                {getFieldError('name') && (
                  <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
                    <AlertCircle size={12} />
                    <span>{getFieldError('name')}</span>
                  </div>
                )}
              </div>

              {/* Teacher Selection */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                  <User size={14} className="text-gray-500" />
                  اسم المعلم <span className="text-red-500">*</span>
                </label>
                <select
                  name="teacher"
                  value={formData.teacher}
                  onChange={handleChange}
                  onBlur={() => handleBlur('teacher')}
                  title="اختر المعلم المسؤول عن الحلقة"
                  className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-right ${
                    getFieldError('teacher')
                      ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}>
                  <option value="">
                    {loadingTeachers ? "جاري التحميل..." : "اختر المعلم"}
                  </option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {`${teacher.firstName} ${teacher.lastName || ''}`}
                    </option>
                  ))}
                </select>
                {getFieldError('teacher') && (
                  <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
                    <AlertCircle size={12} />
                    <span>{getFieldError('teacher')}</span>
                  </div>
                )}
              </div>

              {/* Capacity */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Hash size={14} className="text-gray-500" />
                  السعة القصوى
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity?.toString() || ''}
                  onChange={handleChange}
                  onBlur={() => handleBlur('capacity')}
                  min="1"
                  max="50"
                  placeholder="20"
                  className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-right ${
                    getFieldError('capacity')
                      ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                {getFieldError('capacity') && (
                  <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
                    <AlertCircle size={12} />
                    <span>{getFieldError('capacity')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-green-500 rounded-full"></div>
              <FileText className="text-green-600" size={20} />
              معلومات إضافية
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Schedule */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Clock size={14} className="text-gray-500" />
                  الجدول الزمني
                </label>
                <input
                  type="text"
                  name="schedule"
                  value={formData.schedule || ''}
                  onChange={handleChange}
                  onBlur={() => handleBlur('schedule')}
                  placeholder="مثال: الأحد والثلاثاء 4:00 - 5:30"
                  className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-right ${
                    getFieldError('schedule')
                      ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                {getFieldError('schedule') && (
                  <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
                    <AlertCircle size={12} />
                    <span>{getFieldError('schedule')}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                  <FileText size={14} className="text-gray-500" />
                  الوصف
                </label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  onBlur={() => handleBlur('description')}
                  rows={3}
                  placeholder="وصف مختصر عن الحلقة وأهدافها..."
                  className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-right resize-none ${
                    getFieldError('description')
                      ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                {getFieldError('description') && (
                  <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
                    <AlertCircle size={12} />
                    <span>{getFieldError('description')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              الحقول المميزة بـ <span className="text-red-500">*</span> مطلوبة
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                إلغاء
              </button>
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 shadow-lg shadow-blue-500/30">
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    <span>{group ? "تعديل الحلقة" : "إضافة الحلقة"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGroupForm;
