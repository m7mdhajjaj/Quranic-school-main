import { useState, useEffect, useRef } from 'react';

interface DatePickerProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

export const DatePicker = ({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  className = '',
}: DatePickerProps) => {
  const currentYear = new Date().getFullYear();
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const isInternalChange = useRef(false);

  // أسماء الأشهر بالعربية
  const monthsInArabic = [
    { value: '01', label: 'يناير' },
    { value: '02', label: 'فبراير' },
    { value: '03', label: 'مارس' },
    { value: '04', label: 'أبريل' },
    { value: '05', label: 'مايو' },
    { value: '06', label: 'يونيو' },
    { value: '07', label: 'يوليو' },
    { value: '08', label: 'أغسطس' },
    { value: '09', label: 'سبتمبر' },
    { value: '10', label: 'أكتوبر' },
    { value: '11', label: 'نوفمبر' },
    { value: '12', label: 'ديسمبر' },
  ];

  // تحديث القيم عند تغيير value من الخارج
  useEffect(() => {
    if (!isInternalChange.current && value) {
      const [y, m, d] = value.split('-');
      setYear(y || '');
      setMonth(m || '');
      setDay(d || '');
    }
    isInternalChange.current = false;
  }, [value]);

  // تحديث التاريخ عند تغيير أي حقل
  useEffect(() => {
    if (day && month && year && day !== '' && month !== '' && year !== '') {
      const formattedDate = `${year}-${month}-${day.padStart(2, '0')}`;
      isInternalChange.current = true;
      const event = {
        target: {
          name,
          value: formattedDate,
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    } else if (day === '' || month === '' || year === '') {
      // إذا تم مسح أي حقل، امسح التاريخ
      isInternalChange.current = true;
      const event = {
        target: {
          name,
          value: '',
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    }
  }, [day, month, year, name]);

  // الحصول على عدد أيام الشهر
  const getDaysInMonth = () => {
    if (!month || !year) return 31;
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    return daysInMonth;
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDay(e.target.value);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = e.target.value;
    setMonth(newMonth);
    // إذا كان اليوم المختار أكبر من أيام الشهر الجديد، قم بتصفيره
    if (day && year && newMonth) {
      const maxDays = new Date(parseInt(year), parseInt(newMonth), 0).getDate();
      if (parseInt(day) > maxDays) {
        setDay('');
      }
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = e.target.value;
    setYear(newYear);
    // تحقق من صحة اليوم المختار مع السنة والشهر الجديدين
    if (day && month && newYear) {
      const maxDays = new Date(parseInt(newYear), parseInt(month), 0).getDate();
      if (parseInt(day) > maxDays) {
        setDay('');
      }
    }
  };

  return (
    <div className={className} dir="rtl">
      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </label>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* السنة */}
        <div className="relative">
          <select
            value={year}
            onChange={handleYearChange}
            aria-label="السنة"
            className={`w-full px-2 sm:px-4 py-2 sm:py-3 pl-8 sm:pl-10 border-2 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 appearance-none cursor-pointer text-right text-xs sm:text-base ${
              error
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-200 hover:border-emerald-300 focus:border-emerald-500 focus:ring-emerald-200'
            }`}
            required={required}
          >
            <option value="">السنة</option>
            {Array.from({ length: 100 }, (_, i) => currentYear - i).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          {/* سهم القائمة المنسدلة */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* الشهر */}
        <div className="relative">
          <select
            value={month}
            onChange={handleMonthChange}
            aria-label="الشهر"
            className={`w-full px-2 sm:px-4 py-2 sm:py-3 pl-8 sm:pl-10 border-2 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 appearance-none cursor-pointer text-right text-xs sm:text-base ${
              error
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-200 hover:border-emerald-300 focus:border-emerald-500 focus:ring-emerald-200'
            }`}
            required={required}
          >
            <option value="">الشهر</option>
            {monthsInArabic.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          {/* سهم القائمة المنسدلة */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* اليوم */}
        <div className="relative">
          <select
            value={day}
            onChange={handleDayChange}
            aria-label="اليوم"
            className={`w-full px-2 sm:px-4 py-2 sm:py-3 pl-8 sm:pl-10 border-2 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 appearance-none text-right text-xs sm:text-base ${
              !month || !year 
                ? 'cursor-not-allowed opacity-50 bg-gray-100 border-gray-200'
                : 'cursor-pointer hover:border-emerald-300 focus:border-emerald-500 focus:ring-emerald-200'
            } ${
              error && month && year
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
                : !month || !year ? '' : 'border-gray-200'
            }`}
            required={required}
            disabled={!month || !year}
          >
            <option value="">اليوم</option>
            {month && year && Array.from({ length: getDaysInMonth() }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {/* سهم القائمة المنسدلة */}
          <div className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${!month || !year ? 'text-gray-300' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};
