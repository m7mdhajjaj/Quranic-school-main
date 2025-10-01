// مثال على كيفية استخدام Student Validation مع React Hook Form
// يمكن استخدام هذا كبديل للـ AddStudentForm الحالي

import React from 'react';
import { useForm } from 'react-hook-form';
import { 
  validateStudent, 
  normalizeGender, 
  calculateAge,
  type StudentFormData 
} from '../utils/studentValidation';

interface StudentFormWithHookFormProps {
  onClose: () => void;
  onSuccess: (data: StudentFormData) => void;
  student?: Partial<StudentFormData>;
}

const StudentFormWithHookForm: React.FC<StudentFormWithHookFormProps> = ({
  onClose,
  onSuccess,
  student,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<StudentFormData>({
    defaultValues: {
      firstName: student?.firstName || '',
      fatherName: student?.fatherName || '',
      grandFatherName: student?.grandFatherName || '',
      motherName: student?.motherName || '',
      lastName: student?.lastName || '',
      idNumber: student?.idNumber || '',
      birthDate: student?.birthDate || '',
      gender: student?.gender || '',
      residence: student?.residence || '',
      teacher: student?.teacher || '',
      group: student?.group || '',
      email: student?.email || '',
      phoneNumber: student?.phoneNumber || '',
    },
  });

  // مراقبة تغييرات تاريخ الميلاد لحساب العمر
  const birthDate = watch('birthDate');
  const gender = watch('gender');

  React.useEffect(() => {
    if (birthDate) {
      const age = calculateAge(birthDate);
      setValue('age', age);
    }
  }, [birthDate, setValue]);

  React.useEffect(() => {
    if (gender) {
      const normalizedGender = normalizeGender(gender);
      if (normalizedGender !== gender) {
        setValue('gender', normalizedGender);
      }
    }
  }, [gender, setValue]);

  const onSubmit = async (data: StudentFormData) => {
    // إضافة كلمة المرور للطلاب الجدد
    const dataToValidate: StudentFormData = {
      ...data,
      password: !student ? data.idNumber : undefined,
      age: calculateAge(data.birthDate),
      gender: normalizeGender(data.gender),
    };

    // تشغيل الـ validation
    const validationResult = validateStudent(dataToValidate);

    if (!validationResult.isValid) {
      // عرض أخطاء التحقق في الحقول
      validationResult.errors.forEach((error) => {
        setError(error.field as keyof StudentFormData, {
          type: 'validation',
          message: error.message,
        });
      });
      return;
    }

    // تنظيف الأخطاء عند نجاح التحقق
    clearErrors();

    try {
      await onSuccess(dataToValidate);
      onClose();
    } catch (error) {
      console.error('Error saving student:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-8 mx-4">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-2xl font-bold text-gray-900">
            {student ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* المعلومات الشخصية */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              المعلومات الشخصية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الاسم الأول *
                </label>
                <input
                  {...register('firstName')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.firstName
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم الأب *
                </label>
                <input
                  {...register('fatherName')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.fatherName
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.fatherName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.fatherName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم الجد *
                </label>
                <input
                  {...register('grandFatherName')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.grandFatherName
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.grandFatherName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.grandFatherName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم الأم *
                </label>
                <input
                  {...register('motherName')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.motherName
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.motherName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.motherName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم العائلة *
                </label>
                <input
                  {...register('lastName')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.lastName
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الهوية *
                </label>
                <input
                  {...register('idNumber')}
                  placeholder="9 أرقام"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.idNumber
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.idNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.idNumber.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تاريخ الميلاد *
                </label>
                <input
                  type="date"
                  {...register('birthDate')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.birthDate
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.birthDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.birthDate.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الجنس *
                </label>
                <select
                  {...register('gender')}
                  title="اختيار الجنس"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.gender
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                >
                  <option value="">اختر الجنس</option>
                  <option value="ذكر">ذكر</option>
                  <option value="أنثى">أنثى</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.gender.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  مكان السكن *
                </label>
                <input
                  {...register('residence')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.residence
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.residence && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.residence.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* معلومات الدراسة */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              معلومات الدراسة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم المعلم *
                </label>
                <input
                  {...register('teacher')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.teacher
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.teacher && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.teacher.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم الحلقة *
                </label>
                <input
                  {...register('group')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.group
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.group && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.group.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* معلومات التواصل */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              معلومات التواصل
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الهاتف *
                </label>
                <input
                  type="tel"
                  {...register('phoneNumber')}
                  placeholder="05xxxxxxxx"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.phoneNumber
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  البريد الإلكتروني (اختياري)
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* أزرار التحكم */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 text-white rounded-md transition-colors ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting
                ? 'جاري الحفظ...'
                : student
                ? 'تعديل الطالب'
                : 'إضافة الطالب'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentFormWithHookForm;