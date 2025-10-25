import React from 'react';

interface FeatureItem {
  icon: React.ReactNode;
  text: string;
}

interface FeatureListProps {
  items: FeatureItem[];
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export const FeatureList: React.FC<FeatureListProps> = ({
  items,
  align = 'start',
  className = '',
}) => {
  const alignments = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
  };

  return (
    <div className={`pt-4 space-y-3 text-emerald-700/80 ${className}`}>
      {items.map((item, index) => (
        <div
          key={index}
          className={`flex items-center lg:${alignments[align]} ${alignments.center} gap-3`}
        >
          <div className="w-5 h-5 flex-shrink-0">
            {item.icon}
          </div>
          <span className="text-sm sm:text-base">{item.text}</span>
        </div>
      ))}
    </div>
  );
};
