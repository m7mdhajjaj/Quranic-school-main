import React, { memo, useCallback } from 'react';
import { Avatar } from '../../../components/Avatar';
import { Trash2 } from 'lucide-react';
import { useConversationItem } from '../hooks/useConversationItem';
import type { Conversation } from '../types';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  isTyping?: boolean;
  currentUserId: string;
  onSelect: (conv: Conversation) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

const ConversationItem: React.FC<ConversationItemProps> = memo(({ 
  conversation, 
  isSelected, 
  isTyping,
  currentUserId, 
  onSelect, 
  onDelete 
}) => {
  const {
    displayInfo,
    formattedTime,
    lastMessageText,
    showUnreadBadge,
    unreadCountText
  } = useConversationItem({ conversation, currentUserId });

  const handleSelect = useCallback(() => {
    onSelect(conversation);
  }, [onSelect, conversation]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    onDelete(e, conversation._id);
  }, [onDelete, conversation._id]);

  return (
    <div 
      onClick={handleSelect}
      className={`flex items-center p-2.5 sm:p-3 mx-1 rounded-xl cursor-pointer transition-all duration-200 relative group ${
        isSelected
          ? 'bg-emerald-50 shadow-sm ring-1 ring-emerald-500/20'
          : 'hover:bg-gray-50'
      }`}
    >
      <div className="ml-2 sm:ml-3 relative flex-shrink-0">
        <Avatar 
          userId={displayInfo.userId}
          src={displayInfo.avatar || undefined}
          userName={displayInfo.name}
          size="sm"
          showStatus={conversation.type === 'DM'}
          statusSize="sm"
          className="w-10 h-10 sm:w-12 sm:h-12"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-0.5 gap-2">
          <div className={`text-sm sm:text-base font-bold truncate ${isSelected ? 'text-gray-900' : 'text-gray-800'}`}>
            {displayInfo.name}
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            {formattedTime && (
              <div className={`text-[9px] sm:text-[10px] ${isSelected ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
                {formattedTime}
              </div>
            )}
            <button
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all duration-200"
              title="حذف المحادثة"
              aria-label="حذف المحادثة"
            >
              <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center gap-2">
          <div className={`text-xs sm:text-sm truncate flex-1 ${
            isSelected ? 'text-emerald-700/80 font-medium' : 
            isTyping ? 'text-emerald-600 font-bold animate-pulse' :
            showUnreadBadge ? 'text-gray-800 font-semibold' : 'text-gray-500'
          }`}>
            {isTyping ? '✍️ يكتب الآن...' : lastMessageText}
          </div>
          
          {showUnreadBadge && !isTyping && (
            <div className="min-w-[16px] sm:min-w-[18px] h-[16px] sm:h-[18px] flex items-center justify-center bg-emerald-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full shadow-sm flex-shrink-0">
              {unreadCountText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ConversationItem.displayName = 'ConversationItem';

export default ConversationItem;
