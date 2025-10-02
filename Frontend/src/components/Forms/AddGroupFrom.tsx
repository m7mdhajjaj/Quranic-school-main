// Example component showing how to use the Group validation hook
// مثال على كيفية استخدام خطاف التحقق من الحلقات

import React from 'react';
import { AlertCircle, Save, X } from 'lucide-react';
import { useGroupValidation } from '../../hooks/useGroupValidation';
import { createGroup, updateGroup, type Group } from '../../Api/groupApi';

interface SimpleGroupFormProps {
  group?: Group | null;
  onSuccess?: (group: Group) => void;
  onCancel?: () => void;
}

const SimpleGroupForm: React.FC<SimpleGroupFormProps> = ({
  group,
  onSuccess,
  onCancel,
}) => {
  // Use the validation hook
  const {
    formData,
    errors,
    touchedFields,
    isValid,
    isSubmitting,
    handleFieldChange,
    handleFieldBlur,
    handleSubmit,
  } = useGroupValidation({
    initialData: group ? {
      name: group.name,
      teacher: group.teacher,
      description: group.description || '',
      capacity: group.capacity || 20,
      schedule: group.schedule || '',
    } : undefined,
    validateOnBlur: true,
    validateOnChange: false,
  });

  // Get field error helper
  const getFieldError = (fieldName: string) => {
    return touchedFields.has(fieldName) ? errors[fieldName] : '';
  };

  // Submit handler
  const onSubmit = async (data: typeof formData) => {
    try {
      let result;
      
      if (group && group._id) {
        // Update existing group
        result = await updateGroup(group._id, data);
      } else {
        // Create new group
        result = await createGroup(data);
      }
      
      if (result.success && result.data) {
        onSuccess?.(result.data);
      } else {
        throw new Error(result.message || 'فشل في حفظ البيانات');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      throw error; // Let the hook handle the error
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {group ? 'تعديل الحلقة' : 'إضافة حلقة جديدة'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
            title="إغلاق">
            <X size={24} />
          </button>
        </div>

        {/* Error Messages */}
        {errors.submit && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle size={18} />
              <span className="font-medium">خطأ</span>
            </div>
            <p className="text-red-600 mt-1">{errors.submit}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              اسم الحلقة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFieldChange}
              onBlur={() => handleFieldBlur('name')}
              placeholder="أدخل اسم الحلقة"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-right ${
                getFieldError('name')
                  ? 'border-red-300 focus:ring-red-500 bg-red-50'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {getFieldError('name') && (
              <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                <AlertCircle size={14} />
                <span>{getFieldError('name')}</span>
              </div>
            )}
          </div>

          {/* Teacher Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              المعلم <span className="text-red-500">*</span>
            </label>
            <select
              name="teacher"
              value={formData.teacher}
              onChange={handleFieldChange}
              onBlur={() => handleFieldBlur('teacher')}
              title="اختر المعلم المسؤول عن الحلقة"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-right ${
                getFieldError('teacher')
                  ? 'border-red-300 focus:ring-red-500 bg-red-50'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}>
              <option value="">اختر المعلم</option>
              <option value="teacher1">أستاذ أحمد محمد</option>
              <option value="teacher2">أستاذة فاطمة علي</option>
              <option value="teacher3">أستاذ محمد حسن</option>
            </select>
            {getFieldError('teacher') && (
              <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                <AlertCircle size={14} />
                <span>{getFieldError('teacher')}</span>
              </div>
            )}
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              السعة القصوى
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity?.toString() || ''}
              onChange={handleFieldChange}
              onBlur={() => handleFieldBlur('capacity')}
              min="1"
              max="50"
              placeholder="20"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-right ${
                getFieldError('capacity')
                  ? 'border-red-300 focus:ring-red-500 bg-red-50'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {getFieldError('capacity') && (
              <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                <AlertCircle size={14} />
                <span>{getFieldError('capacity')}</span>
              </div>
            )}
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الجدول الزمني
            </label>
            <input
              type="text"
              name="schedule"
              value={formData.schedule || ''}
              onChange={handleFieldChange}
              onBlur={() => handleFieldBlur('schedule')}
              placeholder="مثال: الأحد والثلاثاء 4:00 - 5:30"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-right ${
                getFieldError('schedule')
                  ? 'border-red-300 focus:ring-red-500 bg-red-50'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {getFieldError('schedule') && (
              <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                <AlertCircle size={14} />
                <span>{getFieldError('schedule')}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الوصف
            </label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleFieldChange}
              onBlur={() => handleFieldBlur('description')}
              rows={3}
              placeholder="وصف مختصر عن الحلقة..."
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-right resize-none ${
                getFieldError('description')
                  ? 'border-red-300 focus:ring-red-500 bg-red-50'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {getFieldError('description') && (
              <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                <AlertCircle size={14} />
                <span>{getFieldError('description')}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors">
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{group ? 'تعديل' : 'حفظ'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimpleGroupForm;