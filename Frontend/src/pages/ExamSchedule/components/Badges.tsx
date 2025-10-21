import React from 'react';
import { Badge } from './Badge';
import { cn } from '../utils';

export const ResultBadge: React.FC<{ text?: string }> = ({ text }) => (
  <Badge intent={text && text.trim() ? 'success' : 'muted'} className="text-xs md:text-sm">
    {text && text.trim() ? text : '-'}
  </Badge>
);

export const AvgBadge: React.FC<{ value: number | null | undefined }> = ({ value }) => (
  <ResultBadge text={value != null ? `${value.toFixed(2)}` : ''} />
);

export const StudentMarkDisplay: React.FC<{
  mark: string | undefined;
  isDesktop?: boolean;
}> = ({ mark, isDesktop = false }) => {
  if (!mark || mark.trim() === '') {
    return (
      <div className={cn('flex items-center justify-center', isDesktop ? 'gap-2' : 'flex-col gap-1')}>
        <span className="text-gray-400 text-xs md:text-sm font-medium">لم يتم التصحيح</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  }

  const markNum = parseFloat(mark);
  const percentage = (markNum / 100) * 100;

  let colorClasses = {
    text: 'text-emerald-700',
    gradient: 'from-emerald-400 to-emerald-600',
  };

  if (markNum < 50) {
    colorClasses = { text: 'text-red-700', gradient: 'from-red-400 to-red-600' };
  } else if (markNum < 75) {
    colorClasses = { text: 'text-amber-700', gradient: 'from-amber-400 to-amber-600' };
  }

  if (isDesktop) {
    return (
      <div className="flex items-center gap-2 md:gap-3 min-w-[100px] md:min-w-[120px]">
        <div className="flex flex-col items-center">
          <div className={cn('text-lg md:text-2xl font-bold mb-1', colorClasses.text)}>{markNum}</div>
          <div className="text-[10px] md:text-xs text-gray-500">من 100</div>
        </div>
        <div className="flex-1 min-w-[50px] md:min-w-[60px]">
          <div className="relative h-1.5 md:h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500 bg-gradient-to-r', colorClasses.gradient)}
              data-percentage={percentage}
              style={{ width: `${percentage}%` } as React.CSSProperties}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-1.5 md:space-y-2">
      <div className="flex items-center justify-between">
        <span className={cn('text-base md:text-xl font-bold', colorClasses.text)}>{markNum}</span>
        <span className="text-[10px] md:text-xs text-gray-500">من 100</span>
      </div>
      <div className="relative h-2 md:h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500 bg-gradient-to-r shadow-sm', colorClasses.gradient)}
          data-percentage={percentage}
          style={{ width: `${percentage}%` } as React.CSSProperties}
        />
      </div>
      <div className="text-[10px] md:text-xs text-center text-gray-600">
        {percentage >= 75 ? 'ممتاز' : percentage >= 50 ? 'جيد' : 'يحتاج تحسين'}
      </div>
    </div>
  );
};
