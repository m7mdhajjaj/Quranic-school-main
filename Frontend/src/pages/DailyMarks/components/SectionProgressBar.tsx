// SectionProgressBar.tsx - شريط تقدم رصد العلامات

import React from 'react';
import { PROGRESS_COLORS, PROGRESS_HEIGHT } from '../constants';

export type MarkStatus = 'completed' | 'in_progress' | 'not_started';

interface MarksProgress {
  totalStudents: number;
  studentsWithMarks: number;
  percentage: number;
}

interface SectionProgressBarProps {
  status?: MarkStatus;
  progress?: MarksProgress;
  showLabel?: boolean;
  height?: 'sm' | 'md' | 'lg';
}

const SectionProgressBar: React.FC<SectionProgressBarProps> = ({
  status = 'not_started',
  progress = { totalStudents: 0, studentsWithMarks: 0, percentage: 0 },
  showLabel = true,
  height = 'md'
}) => {
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>
            {progress.studentsWithMarks} / {progress.totalStudents} طالب
          </span>
          <span className="font-bold">{progress.percentage}%</span>
        </div>
      )}
      
      <div className={`w-full bg-gray-200 rounded-full ${PROGRESS_HEIGHT[height]} overflow-hidden`}>
        <div
          className={`${PROGRESS_COLORS[status]} ${PROGRESS_HEIGHT[height]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
    </div>
  );
};

export default SectionProgressBar;
