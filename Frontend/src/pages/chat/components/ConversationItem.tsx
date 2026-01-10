import React from 'react';
import { Avatar } from '../../../components/Avatar';
import { Trash2 } from 'lucide-react';
import { useConversationItem } from '../hooks/useConversationItem';
import type { Conversation } from '../types';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  currentUserId: string;
  onSelect: (conv: Conversation) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

const ConversationItem: React.FC<ConversationItemProps> = React.memo(({ 
  conversation, 
  isSelected, 
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

  return (
    <div 
      onClick={() => onSelect(conversation)}
      className={`flex items-center p-3 mx-1 rounded-xl cursor-pointer transition-all duration-200 relative group ${
        isSelected
          ? 'bg-emerald-50 shadow-sm ring-1 ring-emerald-500/20'
          : 'hover:bg-gray-50'
      }`}
    >
      <div className="ml-3 relative">
        <Avatar 
          userId={displayInfo.userId}
          src={displayInfo.avatar || undefined}
          userName={displayInfo.name}
          size="md"
          showStatus={conversation.type === 'DM'}
          statusSize="sm"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-0.5">
          <div className={`font-bold truncate ${isSelected ? 'text-gray-900' : 'text-gray-800'}`}>
            {displayInfo.name}
          </div>
          <div className="flex flex-col items-end gap-1">
            {formattedTime && (
              <div className={`text-[10px] flex-shrink-0 ${isSelected ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
                {formattedTime}
              </div>
            )}
            {/* Delete Button - Shows on Hover */}
            <button
              onClick={(e) => onDelete(e, conversation._id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all duration-200 hover:shadow-md"
              title="حذف المحادثة"
              aria-label="حذف المحادثة"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className={`text-xs truncate max-w-[80%] ${
            isSelected ? 'text-emerald-700/80 font-medium' : 
            showUnreadBadge ? 'text-gray-800 font-semibold' : 'text-gray-500'
          }`}>
            {lastMessageText}
          </div>
          
          {showUnreadBadge && (
            <div className="min-w-[18px] h-[18px] flex items-center justify-center bg-emerald-500 text-white text-[10px] font-bold rounded-full shadow-sm animate-pulse">
              {unreadCountText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default ConversationItem;
