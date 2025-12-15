// SectionStatusFilter.tsx - فلترة المقاطع حسب حالة الرصد

import React from 'react';
import { CheckCircle, Clock, AlertCircle, List } from 'lucide-react';
import { FILTER_COLORS, STATUS_FILTERS } from '../constants';

export type MarkStatus = 'completed' | 'in_progress' | 'not_started';

interface StatusFilterProps {
  selectedStatus: MarkStatus | null;
  onStatusChange: (status: MarkStatus | null) => void;
  counts?: {
    all: number;
    completed: number;
    in_progress: number;
    not_started: number;
  };
}

// Icon mapping
const iconMap = {
  List,
  CheckCircle,
  Clock,
  AlertCircle,
};

const SectionStatusFilter: React.FC<StatusFilterProps> = ({
  selectedStatus,
  onStatusChange,
  counts
}) => {
  const getButtonClasses = (filterValue: MarkStatus | null, color: string) => {
    const isSelected = selectedStatus === filterValue;
    const colorKey = color as keyof typeof FILTER_COLORS;
    const colorClasses = FILTER_COLORS[colorKey] || FILTER_COLORS.emerald;
    
    return `px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${isSelected ? colorClasses.selected : colorClasses.default}`;
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {STATUS_FILTERS.map((filter) => {
        const Icon = iconMap[filter.icon as keyof typeof iconMap];
        const filterValue = filter.value as MarkStatus | null;
        const count = filter.value === null ? counts?.all : counts?.[filter.value as keyof Omit<typeof counts, 'all'>];
        
        return (
          <button
            key={filter.label}
            onClick={() => onStatusChange(filterValue)}
            className={getButtonClasses(filterValue, filter.color)}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium">{filter.label}</span>
            {count !== undefined && (
              <span className={`
                ${selectedStatus === filterValue ? 'bg-white/30 text-white' : 'bg-emerald-100 text-emerald-700'}
                px-2 py-0.5 rounded-full text-xs font-bold
              `}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SectionStatusFilter;
