import { useRef, memo, useMemo } from 'react';
import { Avatar } from '@/components/Avatar';
import { Users } from 'lucide-react';
import type { User } from '../types';

// MentionUser type
export interface MentionUser extends Pick<User, '_id' | 'firstName' | 'lastName' | 'avatar'> {}

interface AllOption {
  _id: 'all';
  firstName: string;
  lastName: string;
}

type DisplayItem = MentionUser | AllOption;

interface MentionDropdownProps {
  isOpen: boolean;
  users: MentionUser[];
  activeIndex: number;
  position: { top: number; left: number };
  onSelect: (user: MentionUser | 'all') => void;
  searchQuery?: string;
}

const MAX_VISIBLE_USERS = 5; // Show only 5 users initially

export const MentionDropdown = memo<MentionDropdownProps>(({
  isOpen,
  users,
  activeIndex,
  onSelect,
  searchQuery = ''
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  
  // All option
  const allOption: AllOption = useMemo(() => ({
    _id: 'all',
    firstName: 'الكل',
    lastName: ''
  }), []);

  // Limit users to MAX_VISIBLE_USERS when not searching
  const visibleUsers = useMemo(() => {
    if (searchQuery.trim()) {
      return users; // Show all matching when searching
    }
    return users.slice(0, MAX_VISIBLE_USERS);
  }, [users, searchQuery]);

  // Combined display list - users first, then "all" option at bottom
  const displayList: DisplayItem[] = useMemo(() => {
    return [...visibleUsers, allOption];
  }, [visibleUsers, allOption]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute bottom-full left-0 right-0 mb-1 z-50 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-1 duration-100"
      dir="rtl"
    >
      <div className="overflow-y-auto max-h-72">
        {displayList.length === 0 ? (
          <div className="px-4 py-3 text-sm text-gray-400 text-center">
            لا يوجد نتائج
          </div>
        ) : (
          displayList.map((item, index) => (
            <div
              key={item._id}
              className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                index === activeIndex
                  ? 'bg-gray-100'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelect(item._id === 'all' ? 'all' : (item as MentionUser))}
            >
              {item._id === 'all' ? (
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-600" />
                </div>
              ) : (
                <Avatar user={item as MentionUser} size="md" />
              )}
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {item.firstName} {item.lastName}
                </span>
                {item._id === 'all' && (
                  <span className="text-xs text-gray-500">
                    ذكر كل من في هذه الدردشة
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

MentionDropdown.displayName = 'MentionDropdown';
