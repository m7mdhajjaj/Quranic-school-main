import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';

// Set locale to Arabic
dayjs.locale('ar');

interface DateRangePickerProps {
  startDate: string | null;
  endDate: string | null;
  onChange: (start: string | null, end: string | null) => void;
  className?: string;
  singleDate?: boolean;
  maxDate?: string;
}

type PresetRange = {
  label: string;
  getValue: () => [string, string];
};

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  className = '',
  singleDate = false,
  maxDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(dayjs()); // Current month view
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ 
    top: 0, 
    left: 0, 
    right: 0,
    width: 0,
    isRtl: true 
  });

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is inside the dropdown (which is in a portal) or the trigger button
      const target = event.target as Node;
      const dropdownElement = document.getElementById('date-range-picker-dropdown');
      
      if (
        containerRef.current && 
        !containerRef.current.contains(target) && 
        dropdownElement && 
        !dropdownElement.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update dropdown position
  const updatePosition = () => {
    if (isOpen && containerRef.current) {
      const buttonRect = containerRef.current.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(containerRef.current);
      const isRtl = computedStyle.direction === 'rtl';
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      // Estimate dropdown width based on screen size (md breakpoint is usually 768px)
      // We use the actual width if available (after first render), otherwise estimate
      const dropdownWidth = dropdownRef.current ? dropdownRef.current.offsetWidth : (screenWidth >= 768 ? 600 : 320);
      const dropdownHeight = dropdownRef.current ? dropdownRef.current.offsetHeight : 400;
      
      let leftPosition = 0;
      
      if (isRtl) {
        // RTL: Align right edge of dropdown with right edge of button
        // Formula: left = buttonRight - dropdownWidth
        const idealLeft = buttonRect.right - dropdownWidth;
        
        // Check if it goes off-screen to the left
        if (idealLeft < 10) {
          // If off-screen, align to left edge of screen with some padding
          leftPosition = 10;
        } else {
          leftPosition = idealLeft;
        }
      } else {
        // LTR: Align left edge of dropdown with left edge of button
        const idealLeft = buttonRect.left;
        
        // Check if it goes off-screen to the right
        if (idealLeft + dropdownWidth > screenWidth - 10) {
          // If off-screen, align to right edge of screen
          leftPosition = screenWidth - dropdownWidth - 10;
        } else {
          leftPosition = idealLeft;
        }
      }

      // Vertical Positioning (Smart Flip)
      const spaceBelow = screenHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      
      // Default to opening down
      let topPosition = buttonRect.bottom + window.scrollY + 8;
      
      // If not enough space below AND more space above, open upwards
      // We add a buffer of 20px
      if (spaceBelow < dropdownHeight + 20 && spaceAbove > dropdownHeight + 20) {
        topPosition = buttonRect.top + window.scrollY - dropdownHeight - 8;
      }

      setDropdownPosition({
        top: topPosition,
        left: leftPosition,
        right: 0, // Not used in calculation anymore
        width: buttonRect.width,
        isRtl
      });
    }
  };

  // Handle window resize/scroll to update position
  useEffect(() => {
    if (!isOpen) return;

    // Initial update
    updatePosition();
    
    // Update after a short delay to ensure rendering is complete and ref is available
    const timer = setTimeout(updatePosition, 0);

    let animationFrameId: number;

    const handleScrollOrResize = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);
    
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen]);

  // Presets
  const presets: PresetRange[] = [
    {
      label: 'اليوم',
      getValue: () => [dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
    },
    {
      label: 'أمس',
      getValue: () => [
        dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
        dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
      ],
    },
    {
      label: 'آخر 7 أيام',
      getValue: () => [
        dayjs().subtract(6, 'day').format('YYYY-MM-DD'),
        dayjs().format('YYYY-MM-DD'),
      ],
    },
    {
      label: 'آخر 30 يوم',
      getValue: () => [
        dayjs().subtract(29, 'day').format('YYYY-MM-DD'),
        dayjs().format('YYYY-MM-DD'),
      ],
    },
    {
      label: 'هذا الشهر',
      getValue: () => [
        dayjs().startOf('month').format('YYYY-MM-DD'),
        dayjs().endOf('month').format('YYYY-MM-DD'),
      ],
    },
    {
      label: 'الشهر الماضي',
      getValue: () => [
        dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
        dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
      ],
    },
  ];

  // Calendar generation
  const generateCalendarDays = () => {
    const startOfMonth = viewDate.startOf('month');
    const endOfMonth = viewDate.endOf('month');
    const startOfWeek = startOfMonth.startOf('week');
    const endOfWeek = endOfMonth.endOf('week');

    const days = [];
    let current = startOfWeek;

    while (current.isBefore(endOfWeek) || current.isSame(endOfWeek, 'day')) {
      days.push(current);
      current = current.add(1, 'day');
    }
    return days;
  };

  const days = generateCalendarDays();
  const weekDays = ['سبت', 'أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];

  // Handlers
  const handleDateClick = (dateStr: string) => {
    if (singleDate) {
      onChange(dateStr, dateStr);
      setIsOpen(false);
      return;
    }

    if (!startDate || (startDate && endDate)) {
      // Start new selection
      onChange(dateStr, null);
    } else {
      // Complete selection
      if (dayjs(dateStr).isBefore(dayjs(startDate))) {
        onChange(dateStr, startDate);
      } else {
        onChange(startDate, dateStr);
      }
      // Don't close immediately to allow user to see selection
      // setIsOpen(false); 
    }
  };

  const handlePresetClick = (preset: PresetRange) => {
    const [start, end] = preset.getValue();
    onChange(start, end);
    setViewDate(dayjs(end)); // Move view to end date
    setIsOpen(false);
  };

  const handleReset = () => {
    onChange(null, null);
    setIsOpen(false);
  };

  const formatDateDisplay = (dateStr: string) => {
    return dayjs(dateStr).format('D MMM YYYY');
  };

  // Check if date is in range
  const isInRange = (date: dayjs.Dayjs) => {
    if (!startDate || !endDate) return false;
    return (
      date.isAfter(dayjs(startDate), 'day') &&
      date.isBefore(dayjs(endDate), 'day')
    );
  };

  const isStart = (date: dayjs.Dayjs) => startDate && date.isSame(dayjs(startDate), 'day');
  const isEnd = (date: dayjs.Dayjs) => endDate && date.isSame(dayjs(endDate), 'day');

  const dropdownContent = (
    <div 
      id="date-range-picker-dropdown"
      ref={dropdownRef}
      className="absolute z-[9999] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col md:flex-row min-w-[320px] md:min-w-[600px]"
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        // We always use left positioning now for consistency and boundary checks
      }}
      dir="rtl"
    >
      {/* Sidebar - Presets */}
      {!singleDate && (
        <div className="w-full md:w-48 bg-gray-50/80 border-b md:border-b-0 md:border-l border-gray-100 p-3 flex flex-col gap-1">
          <p className="text-xs font-semibold text-gray-400 px-2 py-1 mb-1">فترات جاهزة</p>
          {presets.map((preset, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handlePresetClick(preset)}
              className="text-right px-3 py-2 text-sm text-gray-600 hover:bg-white hover:text-emerald-700 hover:shadow-sm rounded-lg transition-all"
            >
              {preset.label}
            </button>
          ))}
          
          <div className="mt-auto pt-3 border-t border-gray-200/50">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 text-right px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all w-full"
            >
              <RotateCcw size={14} />
              <span>إعادة تعيين</span>
            </button>
          </div>
        </div>
      )}

      {/* Calendar Area */}
      <div className="flex-1 p-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4 px-1">
          <button 
            type="button"
            aria-label="الشهر السابق"
            onClick={() => setViewDate(viewDate.subtract(1, 'month'))}
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
          
          <span className="text-base font-bold text-gray-800">
            {viewDate.format('MMMM YYYY')}
          </span>

          <button 
            type="button"
            aria-label="الشهر التالي"
            onClick={() => setViewDate(viewDate.add(1, 'month'))}
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-400 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-1 gap-x-0">
          {days.map((date, index) => {
            const isCurrentMonth = date.isSame(viewDate, 'month');
            const isSelectedStart = isStart(date);
            const isSelectedEnd = isEnd(date);
            const isSelectedRange = isInRange(date);
            const isToday = date.isSame(dayjs(), 'day');
            const isDisabled = maxDate ? date.isAfter(dayjs(maxDate), 'day') : false;
            
            return (
              <button
                key={index}
                type="button"
                onClick={() => !isDisabled && handleDateClick(date.format('YYYY-MM-DD'))}
                onMouseEnter={() => !isDisabled && setHoverDate(date.format('YYYY-MM-DD'))}
                onMouseLeave={() => !isDisabled && setHoverDate(null)}
                disabled={isDisabled}
                className={`
                  relative h-9 w-full flex items-center justify-center text-sm transition-all
                  ${isDisabled ? 'text-gray-300 cursor-not-allowed opacity-50' : ''}
                  ${!isDisabled && !isCurrentMonth ? 'text-gray-300' : ''}
                  ${!isDisabled && isCurrentMonth ? 'text-gray-700' : ''}
                  ${!isDisabled && isSelectedRange ? 'bg-emerald-50 text-emerald-700' : ''}
                  ${!isDisabled && isSelectedStart ? 'bg-emerald-600 text-white rounded-r-lg z-10' : ''}
                  ${!isDisabled && isSelectedEnd ? 'bg-emerald-600 text-white rounded-l-lg z-10' : ''}
                  ${!isDisabled && !isSelectedStart && !isSelectedEnd && !isSelectedRange && isToday ? 'font-bold text-emerald-600' : ''}
                  ${!isDisabled && !isSelectedStart && !isSelectedEnd && !isSelectedRange ? 'hover:bg-gray-100 rounded-lg' : ''}
                `}
              >
                {date.format('D')}
              </button>
            );
          })}
        </div>
        
        {/* Footer Info */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>
            {startDate ? dayjs(startDate).format('D MMM YYYY') : '--'} 
            {' '}-{' '} 
            {endDate ? dayjs(endDate).format('D MMM YYYY') : '--'}
          </span>
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
            >
              إلغاء
            </button>
            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={!startDate || !endDate}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              تطبيق
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`relative ${className}`} ref={containerRef} dir="rtl">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          group flex items-center justify-between gap-3 w-full md:w-auto min-w-[220px] h-[42px] px-2 pl-4
          bg-white border border-gray-200 rounded-lg shadow-sm transition-all duration-200
          hover:border-emerald-500 hover:shadow-md
          ${isOpen 
            ? 'border-emerald-500 ring-2 ring-emerald-100' 
            : ''
          }
        `}
      >
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-md transition-colors ${isOpen ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500 group-hover:bg-emerald-50 group-hover:text-emerald-600'}`}>
            <CalendarIcon size={18} />
          </div>
          <span className={`text-sm font-medium ${startDate ? 'text-emerald-700' : 'text-gray-600'}`}>
            {singleDate 
              ? (startDate ? formatDateDisplay(startDate) : 'اختر التاريخ')
              : (startDate && endDate 
                  ? `${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}`
                  : startDate 
                    ? `${formatDateDisplay(startDate)} - ...`
                    : 'اختر الفترة الزمنية'
                )
            }
          </span>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-500' : 'group-hover:text-emerald-500'}`} 
        />
      </button>

      {/* Dropdown Content (Portal) */}
      {isOpen && createPortal(dropdownContent, document.body)}
    </div>
  );
};
