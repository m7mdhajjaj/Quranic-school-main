



import React, { useState, useCallback, useMemo, useEffect } from "react";
import { AlertCircle, X, Loader2, Check, User, School, Phone, Calendar, MapPin, Mail, CreditCard, Users, ChevronRight, ChevronLeft } from "lucide-react";
import { validateStudentWithYup, type StudentFormData } from "../../Validation/studentValidation";
import { createStudent, updateStudent, type Student } from "../../Api/studentApi";
import { getAllTeachers, type Teacher } from "../../Api/teacherApi";
import { getAllGroups, type Group } from "../../Api/groupApi";

// Using centralized validation from studentValidation.ts

// دالة لتحويل التاريخ من الخادم إلى تنسيق input[type="date"]
const formatDateForInput = (dateValue?: string | Date): string => {
  if (!dateValue) return "";
  
  try {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    if (isNaN(date.getTime())) return "";
    
    // تحويل التاريخ إلى تنسيق YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('خطأ في تحويل التاريخ:', error);
    return "";
  }
};

const normalizeGender = (value: string) => {
  const normalized = value.trim();
  if (normalized === "ذكر" || normalized === "male") return "ذكر";
  if (normalized === "أنثى" || normalized === "female") return "أنثى";
  return normalized;
};

const calculateAge = (birthDate: string) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

interface Props {
  onClose: () => void;
  onSuccess: (studentData: Student | StudentFormData) => void;
  student?: Student;
}

const EnhancedStudentForm: React.FC<Props> = ({ onClose, onSuccess, student }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: student?.firstName || "",
    fatherName: student?.fatherName || "",
    grandFatherName: student?.grandFatherName || "",
    motherName: student?.motherName || "",
    lastName: student?.lastName || "",
    idNumber: student?.idNumber || "",
    birthDate: formatDateForInput(student?.birthDate),
    gender: student?.gender || "",
    residence: student?.residence || "",
    teacher: student?.teacher || "",
    group: student?.group || "",
    email: student?.email || "",
    phoneNumber: student?.phoneNumber || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // States for dropdowns
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const calculatedAge = useMemo(() => {
    return formData.birthDate ? calculateAge(formData.birthDate) : null;
  }, [formData.birthDate]);

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
      setLoadingGroups(true);
      try {
        const result = await getAllGroups();
        if (result.success && result.data) {
          setGroups(result.data);
          setFilteredGroups(result.data);
          console.log('✅ تم تحميل الحلقات بنجاح:', result.data.length, 'حلقة');
        } else {
          console.error('❌ فشل في تحميل الحلقات:', result.message);
          setGroups([]);
          setFilteredGroups([]);
        }
      } catch (error) {
        console.error('❌ خطأ في تحميل الحلقات:', error);
        setGroups([]);
        setFilteredGroups([]);
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchTeachers();
    fetchGroups();
  }, []);

  // Filter groups when teacher is selected - improved matching
  useEffect(() => {
    if (formData.teacher) {
      console.log('🔍 Filtering groups for teacher:', formData.teacher);
      console.log('📋 Available groups:', groups.map(g => ({ name: g.name, teacher: g.teacher, teacherName: g.teacherName })));
      
      const teacherGroups = groups.filter(group => {
        // Normalize teacher names for comparison
        const normalizeTeacherName = (name: string) => name?.trim().toLowerCase().replace(/\s+/g, ' ') || '';
        const normalizedFormTeacher = normalizeTeacherName(formData.teacher);
        const normalizedGroupTeacher = normalizeTeacherName(group.teacher || '');
        const normalizedGroupTeacherName = normalizeTeacherName(group.teacherName || '');
        
        // Check multiple possible matches
        const matches = (
          group.teacher === formData.teacher ||                           // Exact teacher field match
          group.teacherName === formData.teacher ||                       // Teacher name match  
          normalizedGroupTeacher === normalizedFormTeacher ||             // Normalized exact match
          normalizedGroupTeacherName === normalizedFormTeacher ||         // Normalized name match
          normalizedGroupTeacher.includes(normalizedFormTeacher) ||       // Partial match in teacher field
          normalizedGroupTeacherName.includes(normalizedFormTeacher) ||   // Partial match in teacherName field
          normalizedFormTeacher.includes(normalizedGroupTeacher) ||       // Reverse partial match
          normalizedFormTeacher.includes(normalizedGroupTeacherName)      // Reverse partial name match
        );
        
        if (matches) {
          console.log('✅ Group matched:', group.name, 'with teacher:', group.teacher || group.teacherName);
        }
        
        return matches;
      });
      
      console.log('🎯 Filtered groups:', teacherGroups.map(g => g.name));
      setFilteredGroups(teacherGroups);
      
      // Only clear group selection if we're not editing an existing student
      // and the group is not available for the selected teacher
      if (formData.group && !teacherGroups.some(group => group.name === formData.group)) {
        if (!student) { // Only clear for new students, not when editing
          console.log('⚠️ Current group not available for selected teacher, clearing...');
          setFormData(prev => ({...prev, group: ''}));
        } else {
          console.log('📝 Editing existing student - keeping original group even if not in filtered list');
          // When editing, show all groups so the original group remains visible
          setFilteredGroups(groups);
        }
      }
    } else {
      setFilteredGroups(groups);
    }
  }, [formData.teacher, groups, formData.group, student]);

  const isStep1Valid = useMemo(() => {
    const step1Fields = [
      'firstName', 'fatherName', 'grandFatherName', 'motherName', 
      'lastName', 'idNumber', 'birthDate', 'gender', 'residence'
    ];
    return step1Fields.every(field => formData[field as keyof typeof formData]?.toString().trim());
  }, [formData]);

  const isStep2Valid = useMemo(() => {
    const step2Fields = ['teacher', 'group', 'phoneNumber'];
    return step2Fields.every(field => formData[field as keyof typeof formData]?.toString().trim());
  }, [formData]);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    if (name === 'gender') {
      processedValue = normalizeGender(value);
    }
    
    if (name === 'phoneNumber') {
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    }
    
    if (name === 'idNumber') {
      processedValue = value.replace(/\D/g, '').slice(0, 9);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleBlur = useCallback((fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
  }, []);

  const handleNextStep = () => {
    if (isStep1Valid) {
      setCurrentStep(2);
    } else {
      const step1Fields = [
        'firstName', 'fatherName', 'grandFatherName', 'motherName', 
        'lastName', 'idNumber', 'birthDate', 'gender', 'residence'
      ];
      setTouchedFields(prev => new Set([...prev, ...step1Fields]));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    if (!isStep2Valid) {
      const step2Fields = ['teacher', 'group', 'phoneNumber'];
      setTouchedFields(prev => new Set([...prev, ...step2Fields]));
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate form data first
      const dataToValidate = {
        ...formData,
        age: calculatedAge,
        password: !student ? formData.idNumber : undefined,
      };

      const result = await validateStudentWithYup(dataToValidate, !student);

      if (!result.isValid) {
        setErrors(result.errors);
        setTouchedFields(new Set(Object.keys(formData)));
        setIsSubmitting(false);
        return;
      }

      // If validation passes, call API
      let apiResult;
      if (student && student._id) {
        // Update existing student
        apiResult = await updateStudent(student._id, result.data!);
      } else {
        // Create new student
        apiResult = await createStudent(result.data!);
      }

      if (!apiResult.success) {
        // التحقق من رسائل خطأ التوافق
        const message = apiResult.message || 'حدث خطأ أثناء حفظ البيانات';
        if (message.includes('لا يطابق معلم الحلقة')) {
          setErrors({ 
            teacher: 'المعلم المختار لا يطابق معلم الحلقة',
            group: 'الحلقة المختارة لا تتبع للمعلم المحدد',
            general: message 
          });
        } else {
          setErrors({ general: message });
        }
        setIsSubmitting(false);
        return;
      }

      setErrors({});
      setShowSuccess(true);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      await onSuccess(apiResult.data!);
      setTimeout(onClose, 300);
      
    } catch (error) {
      console.error("Error saving student:", error);
      setErrors({ general: "حدث خطأ أثناء حفظ البيانات" });
      setIsSubmitting(false);
    }
  };

  const getFieldError = (fieldName: string) => {
    return touchedFields.has(fieldName) ? errors[fieldName] : undefined;
  };



  const steps = [
    { number: 1, title: "المعلومات الشخصية", icon: User },
    { number: 2, title: "الدراسة والتواصل", icon: School }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <User className="text-blue-600" size={28} />
                {student ? "تعديل بيانات الطالب" : "إضافة طالب جديد"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {student ? "قم بتحديث معلومات الطالب" : "أدخل بيانات الطالب الكاملة"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200"
              aria-label="إغلاق">
              <X size={24} />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 ${
                    currentStep === step.number
                      ? 'bg-blue-600 text-white shadow-lg'
                      : currentStep > step.number
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      currentStep === step.number
                        ? 'bg-white text-blue-600'
                        : currentStep > step.number
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {currentStep > step.number ? (
                        <Check size={18} />
                      ) : (
                        <step.icon size={18} />
                      )}
                    </div>
                    <span className="font-semibold text-sm hidden sm:block">{step.title}</span>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ChevronLeft className={`${
                    currentStep > step.number ? 'text-green-600' : 'text-gray-300'
                  }`} size={20} />
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
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-fadeIn">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={20} />
              <span className="font-semibold">يرجى إصلاح الأخطاء التالية:</span>
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
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                  <Users className="text-blue-600" size={20} />
                  الاسم الكامل
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <User size={14} className="text-gray-500" />
                      الاسم الأول <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="firstName"
                      type="text"
                      value={formData.firstName || ""}
                      onChange={handleChange}
                      onBlur={() => handleBlur("firstName")}
                      placeholder="أدخل الاسم الأول"
                      className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-right ${
                        getFieldError("firstName")
                          ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {getFieldError("firstName") && (
                      <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
                        <AlertCircle size={12} />
                        <span>{getFieldError("firstName")}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <User size={14} className="text-gray-500" />
                      اسم الأب <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="fatherName"
                      type="text"
                      value={formData.fatherName || ""}
                      onChange={handleChange}
                      onBlur={() => handleBlur("fatherName")}
                      placeholder="أدخل اسم الأب"
                      className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-right ${
                        getFieldError("fatherName")
                          ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {getFieldError("fatherName") && (
                      <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
                        <AlertCircle size={12} />
                        <span>{getFieldError("fatherName")}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <User size={14} className="text-gray-500" />
                      اسم الجد <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="grandFatherName"
                      type="text"
                      value={formData.grandFatherName || ""}
                      onChange={handleChange}
                      onBlur={() => handleBlur("grandFatherName")}
                      placeholder="أدخل اسم الجد"
                      className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-right ${
                        getFieldError("grandFatherName")
                          ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {getFieldError("grandFatherName") && (
                      <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
                        <AlertCircle size={12} />
                        <span>{getFieldError("grandFatherName")}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <User size={14} className="text-gray-500" />
                      اسم الأم <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="motherName"
                      type="text"
                      value={formData.motherName || ""}
                      onChange={handleChange}
                      onBlur={() => handleBlur("motherName")}
                      placeholder="أدخل اسم الأم"
                      className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-right ${
                        getFieldError("motherName")
                          ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {getFieldError("motherName") && (
                      <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
                        <AlertCircle size={12} />
                        <span>{getFieldError("motherName")}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <User size={14} className="text-gray-500" />
                      اسم العائلة <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="lastName"
                      type="text"
                      value={formData.lastName || ""}
                      onChange={handleChange}
                      onBlur={() => handleBlur("lastName")}
                      placeholder="أدخل الكنية"
                      className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-right ${
                        getFieldError("lastName")
                          ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {getFieldError("lastName") && (
                      <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
                        <AlertCircle size={12} />
                        <span>{getFieldError("lastName")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                  <CreditCard className="text-purple-600" size={20} />
                  الهوية وتاريخ الميلاد
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <CreditCard size={14} className="text-gray-500" />
                      رقم الهوية <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="idNumber"
                      type="text"
                      value={formData.idNumber || ""}
                      onChange={handleChange}
                      onBlur={() => handleBlur("idNumber")}
                      placeholder="9 أرقام"
                      className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-right ${
                        getFieldError("idNumber")
                          ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {getFieldError("idNumber") && (
                      <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
                        <AlertCircle size={12} />
                        <span>{getFieldError("idNumber")}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Calendar size={14} className="text-gray-500" />
                      تاريخ الميلاد <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="birthDate"
                      type="date"
                      value={formData.birthDate || ""}
                      onChange={handleChange}
                      onBlur={() => handleBlur("birthDate")}
                      max={new Date().toISOString().split('T')[0]}
                      placeholder="اختر تاريخ الميلاد"
                      className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-right ${
                        getFieldError("birthDate")
                          ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {getFieldError("birthDate") && (
                      <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
                        <AlertCircle size={12} />
                        <span>{getFieldError("birthDate")}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <User size={14} className="text-gray-500" />
                      الجنس <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      onBlur={() => handleBlur('gender')}
                      title="اختر الجنس"
                      className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-right ${
                        getFieldError('gender')
                          ? 'border-red-300 focus:ring-red-500 bg-red-50'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}>
                      <option value="">اختر الجنس</option>
                      <option value="ذكر">ذكر</option>
                      <option value="أنثى">أنثى</option>
                    </select>
                    {getFieldError('gender') && (
                      <div className="flex items-center gap-1 text-red-600 text-xs">
                        <AlertCircle size={12} />
                        <span>{getFieldError('gender')}</span>
                      </div>
                    )}
                  </div>
                  
                  {calculatedAge !== null && (
                    <div className="flex items-end col-span-1">
                      <div className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="text-blue-600" size={14} />
                          <span className="text-xs text-blue-600 font-medium">العمر الحالي</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-700">{calculatedAge} <span className="text-sm">سنة</span></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                  <MapPin className="text-green-600" size={20} />
                  العنوان
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <MapPin size={14} className="text-gray-500" />
                      مكان السكن <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="residence"
                      type="text"
                      value={formData.residence || ""}
                      onChange={handleChange}
                      onBlur={() => handleBlur("residence")}
                      placeholder="أدخل مكان السكن"
                      className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-right ${
                        getFieldError("residence")
                          ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {getFieldError("residence") && (
                      <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
                        <AlertCircle size={12} />
                        <span>{getFieldError("residence")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                  <School className="text-indigo-600" size={20} />
                  معلومات الدراسة
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <User size={14} className="text-gray-500" />
                      اسم المعلم <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="teacher"
                      value={formData.teacher || ""}
                      onChange={handleChange}
                      onBlur={() => handleBlur("teacher")}
                      className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-right ${
                        getFieldError("teacher")
                          ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      title="اختر المعلم"
                    >
                      <option value="">اختر المعلم...</option>
                      {loadingTeachers ? (
                        <option value="" disabled>جاري التحميل...</option>
                      ) : (
                        teachers.map((teacher) => (
                          <option 
                            key={teacher._id} 
                            value={`${teacher.firstName} ${teacher.lastName}`}
                            data-teacher-id={teacher._id}
                          >
                            {teacher.firstName} {teacher.lastName}
                          </option>
                        ))
                      )}
                    </select>
                    {getFieldError("teacher") && (
                      <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
                        <AlertCircle size={12} />
                        <span>{getFieldError("teacher")}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Users size={14} className="text-gray-500" />
                      اسم الحلقة <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="group"
                      value={formData.group || ""}
                      onChange={handleChange}
                      onBlur={() => handleBlur("group")}
                      className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-right ${
                        getFieldError("group")
                          ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      title="اختر الحلقة"
                      disabled={!formData.teacher}
                    >
                      <option value="">
                        {!formData.teacher ? "اختر المعلم أولاً..." : "اختر الحلقة..."}
                      </option>
                      {loadingGroups ? (
                        <option value="" disabled>جاري التحميل...</option>
                      ) : filteredGroups.length > 0 ? (
                        filteredGroups.map((group) => (
                          <option key={group._id} value={group.name}>
                            {group.name} 
                            {group.currentStudents !== undefined && ` (${group.currentStudents} طالب)`}
                            {group.schedule && ` - ${group.schedule}`}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          {formData.teacher ? "لا توجد حلقات متاحة لهذا المعلم" : "لا توجد حلقات متاحة"}
                        </option>
                      )}
                    </select>
                    {getFieldError("group") && (
                      <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
                        <AlertCircle size={12} />
                        <span>{getFieldError("group")}</span>
                      </div>
                    )}
                    
                    {/* رسالة توضيحية عند عدم وجود حلقات */}
                    {!loadingGroups && formData.teacher && filteredGroups.length === 0 && (
                      <div className="flex items-center gap-1 text-amber-600 text-xs animate-fadeIn bg-amber-50 p-3 rounded-lg border border-amber-200">
                        <AlertCircle size={14} />
                        <div>
                          <div className="font-medium">لا توجد حلقات لهذا المعلم</div>
                          <div className="text-amber-500 mt-1">
                            المعلم المحدد: <span className="font-medium">{formData.teacher}</span>
                          </div>
                          <div className="text-amber-500 mt-1">
                            تواصل مع الإدارة لإنشاء حلقة جديدة أو تحقق من اسم المعلم
                          </div>
                          <button
                            type="button"
                            onClick={() => setFilteredGroups(groups)}
                            className="mt-2 text-xs bg-amber-100 hover:bg-amber-200 text-amber-700 px-2 py-1 rounded transition-colors"
                          >
                            عرض جميع الحلقات المتاحة ({groups.length})
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-xl border border-cyan-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <div className="w-1 h-6 bg-cyan-500 rounded-full"></div>
                  <Phone className="text-cyan-600" size={20} />
                  معلومات التواصل
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Phone size={14} className="text-gray-500" />
                      رقم الهاتف <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber || ""}
                      onChange={handleChange}
                      onBlur={() => handleBlur("phoneNumber")}
                      placeholder="05xxxxxxxx"
                      className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-right ${
                        getFieldError("phoneNumber")
                          ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {getFieldError("phoneNumber") && (
                      <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
                        <AlertCircle size={12} />
                        <span>{getFieldError("phoneNumber")}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Mail size={14} className="text-gray-500" />
                      البريد الإلكتروني
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={handleChange}
                      onBlur={() => handleBlur("email")}
                      placeholder="example@email.com"
                      className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-right ${
                        getFieldError("email")
                          ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {getFieldError("email") && (
                      <div className="flex items-center gap-1 text-red-600 text-xs animate-fadeIn">
                        <AlertCircle size={12} />
                        <span>{getFieldError("email")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border-2 border-amber-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Check className="text-amber-600" size={20} />
                  ملخص البيانات
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <span className="text-gray-600 text-xs">الاسم الكامل</span>
                    <p className="font-semibold text-gray-900 mt-1">
                      {formData.firstName} {formData.fatherName} {formData.lastName}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <span className="text-gray-600 text-xs">رقم الهوية</span>
                    <p className="font-semibold text-gray-900 mt-1">{formData.idNumber || '-'}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <span className="text-gray-600 text-xs">الجنس</span>
                    <p className="font-semibold text-gray-900 mt-1">{formData.gender || '-'}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <span className="text-gray-600 text-xs">المعلم</span>
                    <p className="font-semibold text-gray-900 mt-1">{formData.teacher || '-'}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <span className="text-gray-600 text-xs">الحلقة</span>
                    <p className="font-semibold text-gray-900 mt-1">{formData.group || '-'}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <span className="text-gray-600 text-xs">رقم الهاتف</span>
                    <p className="font-semibold text-gray-900 mt-1">{formData.phoneNumber || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {currentStep === 1 ? (
                isStep1Valid ? (
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <Check size={16} />
                    جميع حقول الخطوة الأولى مكتملة
                  </span>
                ) : (
                  <span>الحقول المطلوبة محددة بـ <span className="text-red-500">*</span></span>
                )
              ) : (
                isStep2Valid ? (
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <Check size={16} />
                    جميع حقول الخطوة الثانية مكتملة
                  </span>
                ) : (
                  <span>الحقول المطلوبة محددة بـ <span className="text-red-500">*</span></span>
                )
              )}
            </div>
            
            <div className="flex gap-3">
              {currentStep === 1 ? (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium">
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!isStep1Valid}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 shadow-lg shadow-blue-500/30">
                    <span>التالي</span>
                    <ChevronLeft size={18} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium flex items-center gap-2">
                    <span>السابق</span>
                    <ChevronRight size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !isStep2Valid}
                    className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 shadow-lg shadow-green-500/30">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>جاري الحفظ...</span>
                      </>
                    ) : (
                      <>
                        <Check size={18} />
                        <span>{student ? "تعديل الطالب" : "إضافة الطالب"}</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EnhancedStudentForm;