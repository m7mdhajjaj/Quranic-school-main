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
      className={`flex items-center p-3 mx-1 rounded-xl cursor-pointer transition-all duration-200 relative group ${
        isSelected
          ? 'bg-emerald-50 shadow-sm ring-1 ring-emerald-500/20'
          : 'hover:bg-gray-50'
      }`}
    >
      <div className="ml-3 relative">
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
        <div className="flex justify-between items-baseline mb-0.5">
          <div className={`font-bold truncate ${isSelected ? 'text-gray-900' : 'text-gray-800'}`}>
            {display.name}
          </div>
          {conversation.lastMessage && (
            <div className={`text-[10px] flex-shrink-0 ${isSelected ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
              {new Date(conversation.lastMessage.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
        <div className="flex justify-between items-center">
          <div className={`text-xs truncate max-w-[80%] ${
            isSelected ? 'text-emerald-700/80 font-medium' : 
            conversation.unreadCount > 0 ? 'text-gray-800 font-semibold' : 'text-gray-500'
          }`}>
            {conversation.lastMessage?.text || display.subtitle}
          </div>
          
          {conversation.unreadCount > 0 && (
            <div className="min-w-[18px] h-[18px] flex items-center justify-center bg-emerald-500 text-white text-[10px] font-bold rounded-full shadow-sm animate-pulse">
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </div>
          )}
        </div>
      </div>

      {/* Delete Button - Shows on Hover */}
      <button
        onClick={(e) => onDelete(e, conversation._id)}
        className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 z-10"
        title="حذف المحادثة"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
});

export default ConversationItem;
