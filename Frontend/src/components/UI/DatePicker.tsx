import React from 'react';
import { Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

interface DatePickerProps {
  label?: string;
  value: string; // ISO date string (YYYY-MM-DD)
  onChange: (date: string) => void;
  error?: string;
  success?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  minYear?: number;
  maxYear?: number;
  minDate?: string; // Minimum allowed date (YYYY-MM-DD)
  maxDate?: string; // Maximum allowed date (YYYY-MM-DD)
  minAge?: number; // Minimum age required (e.g., 21 for secretary)
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  error,
  success,
  required = false,
  disabled = false,
  className = '',
  minYear = 1950, // من سنة 1950
  maxYear = new Date().getFullYear() + 10, // حتى السنة الحالية + 10 سنوات للمستقبل
  minDate,
  maxDate,
  minAge, // الحد الأدنى للعمر (اختياري)
}) => {
  // Calculate age from birth date
  const calculateAge = (birthDate: string): number => {
    if (!birthDate || birthDate.length < 10) return 0;
    
    const today = new Date();
    const birth = new Date(birthDate);
    
    if (isNaN(birth.getTime())) return 0;
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };
  
  // Check if a date is valid based on min/max constraints
  const isDateValid = (dateString: string): boolean => {
    if (!dateString) return true;
    
    const date = new Date(dateString);
    
    if (minDate) {
      const min = new Date(minDate);
      min.setHours(0, 0, 0, 0);
      const current = new Date(date);
      current.setHours(0, 0, 0, 0);
      if (current < min) return false;
    }
    
    if (maxDate) {
      const max = new Date(maxDate);
      max.setHours(0, 0, 0, 0);
      const current = new Date(date);
      current.setHours(0, 0, 0, 0);
      if (current > max) return false;
    }
    
    return true;
  };
  // Parse the date value
  const parseDate = (dateString: string) => {
    if (!dateString) {
      const today = new Date();
      const year = String(today.getFullYear());
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return { day, month, year };
    }
    const [year, month, day] = dateString.split('-');
    return { day: day || '', month: month || '', year: year || '' };
  };

  const { day, month, year } = parseDate(value);

  // حساب العمر الحالي
  const currentAge = calculateAge(value);
  
  // التحقق من العمر الأدنى
  const ageError = minAge && value && value.length >= 10 && currentAge < minAge
    ? `يجب أن يكون العمر ${minAge} سنة على الأقل (العمر الحالي: ${currentAge})`
    : undefined;

  // Check if current value violates min/max constraints
  const currentDateError = !isDateValid(value) && value !== '' 
    ? (minDate && new Date(value) < new Date(minDate) 
        ? 'التاريخ لا يمكن أن يكون في الماضي' 
        : 'التاريخ خارج النطاق المسموح')
    : ageError; // إضافة خطأ العمر

  // Handle change for each part with number input
  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newDay = e.target.value;
    // Ensure day is between 1-31
    const dayNum = parseInt(newDay);
    if (dayNum > 31) newDay = '31';
    if (dayNum < 1 && newDay !== '') newDay = '1';
    if (newDay && newDay.length === 1) newDay = '0' + newDay;
    const newDate = `${year || new Date().getFullYear()}-${month || '01'}-${newDay || '01'}`;
    
    // Validate against min/max dates
    if (isDateValid(newDate)) {
      onChange(newDate);
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newMonth = e.target.value;
    // Ensure month is between 1-12
    const monthNum = parseInt(newMonth);
    if (monthNum > 12) newMonth = '12';
    if (monthNum < 1 && newMonth !== '') newMonth = '1';
    if (newMonth && newMonth.length === 1) newMonth = '0' + newMonth;
    const newDate = `${year || new Date().getFullYear()}-${newMonth || '01'}-${day || '01'}`;
    
    // Validate against min/max dates
    if (isDateValid(newDate)) {
      onChange(newDate);
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newYear = e.target.value;
    
    // السماح فقط بالأرقام
    newYear = newYear.replace(/\D/g, '');
    
    // الحد الأقصى 4 أرقام
    if (newYear.length > 4) {
      newYear = newYear.slice(0, 4);
    }
    
    // تحديث القيمة حتى لو كانت أقل من 4 أرقام (للسماح بالكتابة)
    const newDate = `${newYear || ''}-${month || '01'}-${day || '01'}`;
    
    // التحقق من صحة التاريخ فقط إذا كانت السنة 4 أرقام
    if (newYear.length === 4) {
      const yearNum = parseInt(newYear);
      if (yearNum >= minYear && yearNum <= maxYear && isDateValid(newDate)) {
        onChange(newDate);
      } else if (yearNum < minYear || yearNum > maxYear) {
        // لا تحدث إذا خارج النطاق
        return;
      }
    } else {
      // تحديث مؤقت أثناء الكتابة
      onChange(newDate);
    }
  };

  return (
    <div className={`w-full ${className}`} dir="rtl">
      {label && (
        <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-3 text-right">
          <Calendar className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="grid grid-cols-3 gap-3">
        {/* Day */}
        <div>
          <input
            type="number"
            value={day ? parseInt(day) : ''}
            onChange={handleDayChange}
            placeholder="اليوم"
            disabled={disabled}
            required={required}
            min={1}
            max={31}
            className={`w-full px-4 py-2.5 text-center text-base border ${
              currentDateError ? 'border-red-400 bg-red-50' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors ${className}`}
          />
        </div>

        {/* Month */}
        <div>
          <input
            type="number"
            value={month ? parseInt(month) : ''}
            onChange={handleMonthChange}
            placeholder="الشهر"
            disabled={disabled}
            required={required}
            min={1}
            max={12}
            className={`w-full px-4 py-2.5 text-center text-base border ${
              currentDateError ? 'border-red-400 bg-red-50' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors ${className}`}
          />
        </div>

        {/* Year - text input للتحكم الكامل */}
        <div>
          <input
            type="text"
            inputMode="numeric"
            value={year || ''}
            onChange={handleYearChange}
            placeholder="السنة"
            disabled={disabled}
            required={required}
            maxLength={4}
            className={`w-full px-4 py-2.5 text-center text-base border ${
              currentDateError ? 'border-red-400 bg-red-50' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors ${className}`}
          />
        </div>
      </div>

      {(error || currentDateError) && (
        <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error || currentDateError}
        </p>
      )}
      
      {!error && !currentDateError && success && value && (
        <p className="mt-1.5 text-sm text-emerald-600 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {success}
        </p>
      )}
    </div>
  );
};
