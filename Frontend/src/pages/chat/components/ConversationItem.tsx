import React from 'react';
import { Avatar } from '../../../components/Avatar';
import { Badge } from '../../../components/UI';
import { Trash2 } from 'lucide-react';
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
  const getDisplayInfo = () => {
    if (conversation.type === 'GROUP' && conversation.groupId) {
      return {
        name: conversation.groupId.name,
        subtitle: 'محادثة جماعية',
        avatar: (conversation.groupId as any).image?.url || null,
        userId: conversation.groupId._id
      };
    } else {
      const otherParticipant = conversation.participants.find(p => p.userId._id !== currentUserId);
      if (otherParticipant) {
        return {
          name: `${otherParticipant.userId.firstName} ${otherParticipant.userId.lastName}`,
          subtitle: otherParticipant.userModel === 'Student' ? 'طالب' : otherParticipant.userModel === 'Teacher' ? 'معلم' : 'مدير',
          avatar: otherParticipant.userId.avatar?.url,
          userId: otherParticipant.userId._id
        };
      }
    }
    return { name: 'محادثة', subtitle: '', avatar: null, userId: '' };
  };

  const display = getDisplayInfo();

  return (
    <div 
      onClick={() => onSelect(conversation)}
      className={`flex items-center p-3.5 mx-2 my-1 rounded-lg cursor-pointer transition-all duration-200 relative group ${
        isSelected
          ? 'bg-emerald-50 shadow-sm border-r-4 border-emerald-500'
          : 'hover:bg-gray-50'
      }`}
    >
      <div className="ml-3">
        <Avatar 
          userId={display.userId}
          src={display.avatar || undefined}
          userName={display.name}
          size="md"
          showStatus={conversation.type === 'DM'}
          statusSize="sm"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{display.name}</div>
        <div className="text-xs text-gray-500 truncate">
          {conversation.lastMessage?.text || display.subtitle}
        </div>
      </div>

      {/* Delete Button - Shows on Hover */}
      <button
        onClick={(e) => onDelete(e, conversation._id)}
        className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 z-10"
        title="حذف المحادثة"
      >
        <Trash2 size={16} />
      </button>

      {conversation.unreadCount > 0 && (
        <div className="absolute top-3 left-3 min-w-[20px] h-5 flex items-center justify-center">
          <Badge 
            variant="danger"
            className="animate-pulse shadow-sm"
          >
            {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
          </Badge>
        </div>
      )}
    </div>
  );
});

export default ConversationItem;
