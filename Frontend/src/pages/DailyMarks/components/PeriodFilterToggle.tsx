import React from 'react';

interface PeriodFilterToggleProps {
  selectedMode?: 'week' | 'all';
  onModeChange?: (mode: 'week' | 'all') => void;
}

export const PeriodFilterToggle: React.FC<PeriodFilterToggleProps> = ({
  selectedMode = 'all',
  onModeChange,
}) => {
  if (!onModeChange) return null;

  return (
    <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
      <button
        onClick={() => onModeChange('all')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
          selectedMode !== 'week'
            ? 'bg-emerald-100 text-emerald-800 shadow-sm'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
        type="button"
      >
        الكل
      </button>
      <button
        onClick={() => onModeChange('week')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
          selectedMode === 'week'
            ? 'bg-emerald-100 text-emerald-800 shadow-sm'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
        type="button"
      >
        الأسبوع الحالي
      </button>
    </div>
  );
};

export default PeriodFilterToggle;
