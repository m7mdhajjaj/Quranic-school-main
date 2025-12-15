// SectionStatusBadge.tsx - عرض حالة رصد العلامات للمقطع

import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { STATUS_CONFIG } from '../constants';

export type MarkStatus = 'completed' | 'in_progress' | 'not_started';

interface MarksProgress {
  totalStudents: number;
  studentsWithMarks: number;
  percentage: number;
}

interface SectionStatusBadgeProps {
  status?: MarkStatus;
  progress?: MarksProgress;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
}

const SectionStatusBadge: React.FC<SectionStatusBadgeProps> = ({ 
  status = 'not_started',
  progress = { totalStudents: 0, studentsWithMarks: 0, percentage: 0 },
  size = 'md',
  showPercentage = true
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const iconMap = {
    completed: CheckCircle,
    in_progress: Clock,
    not_started: AlertCircle,
  };

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.not_started;
  const Icon = iconMap[status] || AlertCircle;

  return (
    <div 
      className={`
        ${config.bg} 
        ${config.text} 
        ${sizeClasses[size]} 
        rounded-full 
        flex items-center gap-2 
        border ${config.border}
        font-medium
        transition-all
      `}
    >
      <Icon className={iconSizes[size]} />
      <span>{config.label}</span>
      {showPercentage && (
        <span className={`font-bold ${config.color}`}>
          {progress.percentage}%
        </span>
      )}
    </div>
  );
};

export default SectionStatusBadge;
