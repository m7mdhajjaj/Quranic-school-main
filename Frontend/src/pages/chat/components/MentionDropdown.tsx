import { useRef, memo } from 'react';
import ReactDOM from 'react-dom';
import { Avatar } from '@/components/Avatar';
import { useMentionDropdown, type MentionUser } from '../hooks/useMentionDropdown';

interface MentionDropdownProps {
  isOpen: boolean;
  users: MentionUser[];
  activeIndex: number;
  position: { top: number; left: number };
  onSelect: (user: MentionUser | 'all') => void;
}

export const MentionDropdown = memo<MentionDropdownProps>(({
  isOpen,
  users,
  activeIndex,
  position,
  onSelect
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { coords, displayList, hasNoResults } = useMentionDropdown({
    isOpen,
    users,
    position
  });

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      ref={menuRef}
      className={`mention-dropdown fixed z-[9999] w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100`}
      data-top={coords.top}
      data-left={coords.left}
      dir="rtl"
    >
      {/* Header with Gradient to match App Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 px-4 py-2.5 shadow-sm">
        <span className="text-xs font-bold text-white flex items-center gap-1.5">
          <span className="bg-white/20 rounded-full w-4 h-4 flex items-center justify-center text-[10px]">@</span>
          <span>اقتراحات المنشن</span>
        </span>
      </div>
      
      <div className="overflow-y-auto max-h-60 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {displayList.map((item, index) => (
          <div
            key={item._id}
            className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all duration-200 border-b border-gray-50 dark:border-gray-700/50 last:border-0 ${
              index === activeIndex
                ? 'bg-emerald-50 dark:bg-emerald-900/20'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 bg-white dark:bg-gray-800'
            }`}
            onClick={() => onSelect(item._id === 'all' ? 'all' : (item as MentionUser))}
          >
            {item._id === 'all' ? (
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-colors ${
                index === activeIndex 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white' 
                  : 'bg-emerald-100 text-emerald-600'
              }`}>
                @
              </div>
            ) : (
              <div className={`transition-transform ${index === activeIndex ? 'scale-110' : ''}`}>
                <Avatar user={item as MentionUser} size="sm" />
              </div>
            )}
            <div className="flex flex-col">
              <span className={`text-sm font-bold transition-colors ${
                index === activeIndex 
                  ? 'text-emerald-700 dark:text-emerald-400' 
                  : 'text-gray-700 dark:text-gray-200'
              }`}>
                {item.firstName} {item.lastName}
              </span>
              {item._id === 'all' && (
                <span className="text-[10px] text-gray-400">
                  إشعار للجميع
                </span>
              )}
            </div>
            
            {/* Active Indicator */}
            {index === activeIndex && (
              <div className="mr-auto w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </div>
        ))}
        {hasNoResults && (
          <div className="px-4 py-6 text-sm text-gray-400 text-center flex flex-col items-center gap-2">
            <span className="text-2xl opacity-50">🔍</span>
            <span>لا يوجد نتائج...</span>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
});

MentionDropdown.displayName = 'MentionDropdown';
