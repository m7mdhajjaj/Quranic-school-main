import { memo } from 'react';

// Lightweight skeleton for faster initial render
export const MessageSkeleton = memo(() => (
  <div className="space-y-3 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
        <div className={`flex gap-2 max-w-[75%] ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
          <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className={`h-16 bg-gray-200 rounded-2xl ${i % 2 === 0 ? 'rounded-tr-sm' : 'rounded-tl-sm'}`} style={{ width: `${120 + i * 40}px` }} />
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
        </div>
      </div>
    ))}
  </div>
));

MessageSkeleton.displayName = 'MessageSkeleton';
