// مثال عملي: كيفية استخدام studentValidationYup.ts مع فورم الطالب

import React, { useState } from 'react';
import { 
  validateStudentWithYup, 
  validateFieldWithYup,
  normalizeGender,
  calculateAge 
} from '../utils/studentValidationYup';

// 1. استخدام مع نموذج إضافة طالب
const AddStudentExample: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    fatherName: '',
    idNumber: '',
    // ... باقي الحقول
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // استخدام Yup validation
    const result = await validateStudentWithYup(formData, true); // true = طالب جديد
    
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }

    // إرسال البيانات الصحيحة للباك اند
    console.log('بيانات صحيحة:', result.data);
    // API call here...
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        name="firstName"
        value={formData.firstName}
        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
      />
      {errors.firstName && <span className="error">{errors.firstName}</span>}
      {/* باقي الحقول... */}
    </form>
  );
};

// 2. استخدام مع React Hook Form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { studentValidationSchema } from '../utils/studentValidationYup';

const StudentFormWithHookForm: React.FC = () => {
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm({
    resolver: yupResolver(studentValidationSchema), // استخدام Schema مباشرة
  });

  const onSubmit = (data: any) => {
    console.log('بيانات صحيحة:', data);
    // البيانات تم التحقق منها تلقائياً بواسطة Yup
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('firstName')} />
      {errors.firstName && <span>{errors.firstName.message}</span>}
      {/* باقي الحقول... */}
    </form>
  );
};

// 3. استخدام للتحقق من حقل واحد (Real-time validation)
const RealTimeValidationExample: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const handlePhoneChange = async (value: string) => {
    setPhoneNumber(value);
    
    // التحقق الفوري من رقم الهاتف
    const error = await validateFieldWithYup('phoneNumber', value);
    setPhoneError(error || '');
  };

  return (
    <div>
      <input 
        value={phoneNumber}
        onChange={(e) => handlePhoneChange(e.target.value)}
        placeholder="05xxxxxxxx"
      />
      {phoneError && <span className="error">{phoneError}</span>}
    </div>
  );
};

// 4. استخدام الدوال المساعدة
const HelperFunctionsExample: React.FC = () => {
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [age, setAge] = useState(0);

  const handleGenderChange = (value: string) => {
    // تطبيع الجنس تلقائياً
    const normalizedGender = normalizeGender(value);
    setGender(normalizedGender); // سيحول 'male' إلى 'ذكر'
  };

  const handleBirthDateChange = (value: string) => {
    setBirthDate(value);
    // حساب العمر تلقائياً
    const calculatedAge = calculateAge(value);
    setAge(calculatedAge);
  };

  return (
    <div>
      <select onChange={(e) => handleGenderChange(e.target.value)}>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
      <p>الجنس المطبع: {gender}</p>
      
      <input 
        type="date" 
        onChange={(e) => handleBirthDateChange(e.target.value)}
      />
      <p>العمر: {age} سنة</p>
    </div>
  );
};

export {
  AddStudentExample,
  StudentFormWithHookForm, 
  RealTimeValidationExample,
  HelperFunctionsExample
};