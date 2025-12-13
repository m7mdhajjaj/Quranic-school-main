import React from 'react';
import { Calendar } from 'lucide-react';
import { Select } from './Select';

interface DatePickerProps {
  label?: string;
  value: string; // ISO date string (YYYY-MM-DD)
  onChange: (date: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  minYear?: number;
  maxYear?: number;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
  minYear = 1950, // من سنة 1950
  maxYear = new Date().getFullYear(), // حتى السنة الحالية
}) => {
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

  // Generate options
  const days = Array.from({ length: 31 }, (_, i) => ({
    value: String(i + 1).padStart(2, '0'),
    label: String(i + 1),
  }));

  const months = [
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

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => ({
    value: String(maxYear - i),
    label: String(maxYear - i),
  }));

  // Handle change for each part
  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDay = e.target.value;
    const newDate = `${year || new Date().getFullYear()}-${month || '01'}-${newDay}`;
    onChange(newDate);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = e.target.value;
    const newDate = `${year || new Date().getFullYear()}-${newMonth}-${day || '01'}`;
    onChange(newDate);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = e.target.value;
    const newDate = `${newYear}-${month || '01'}-${day || '01'}`;
    onChange(newDate);
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
        <Select
          value={day}
          onChange={handleDayChange}
          options={days}
          placeholder="اليوم"
          disabled={disabled}
          required={required}
          className={className}
        />

        {/* Month */}
        <Select
          value={month}
          onChange={handleMonthChange}
          options={months}
          placeholder="الشهر"
          disabled={disabled}
          required={required}
          className={className}
        />

        {/* Year */}
        <Select
          value={year}
          onChange={handleYearChange}
          options={years}
          placeholder="السنة"
          disabled={disabled}
          required={required}
          className={className}
        />
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1 text-right">
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};
