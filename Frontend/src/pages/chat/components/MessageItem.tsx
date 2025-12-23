import React from 'react';
import { Reply, Check, CheckCheck, Clock, Trash2 } from 'lucide-react';
import { Avatar } from '../../../components/Avatar';
import { Tooltip } from '../../../components/UI';
import { DropdownMenu } from '../../../components/UI/DropdownMenu';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../Api/api';
import { showConfirmMessage, showSuccessMessage, showErrorMessage } from '../../../utils/sweetalertUtils';

interface MessageItemProps {
  message: any;
  isOwn: boolean;
  onReply?: (message: any) => void;
  onReplyClick?: (messageId: string) => void;
  onDelete?: (messageId: string, deletedForAll: boolean) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  isOwn, 
  onReply,
  onReplyClick,
  onDelete
}) => {
  const { user } = useAuth();

  const handleDelete = async (deleteForAll: boolean) => {
    try {
      const confirmed = await showConfirmMessage(
        deleteForAll ? "حذف لدى الجميع؟" : "حذف لديّ؟",
        deleteForAll 
          ? "سيتم حذف الرسالة لدى جميع المشاركين في المحادثة." 
          : "سيتم حذف الرسالة من جهازك فقط.",
        "نعم، احذف",
        "إلغاء"
      );

      if (confirmed.isConfirmed) {
        await api.delete(`/chat/messages/${message._id}`, {
          data: { deleteForAll }
        });
        
        // Optimistic update / Manual handling
        if (onDelete) {
          onDelete(message._id, deleteForAll);
        }
      }
    } catch (error: any) {
      showErrorMessage("خطأ", error.response?.data?.message || "فشل حذف الرسالة");
    }
  };

  const getDropdownItems = () => {
    const items = [
      {
        label: "حذف لديّ",
        icon: <Trash2 size={16} />,
        onClick: () => handleDelete(false),
        variant: 'default' as const
      }
    ];

    // Logic for "Delete for Everyone"
    // 1. Must be own message
    // 2. Not deleted already
    // 3. Less than 3 minutes old
    // 4. Not read (for DM)
    if (isOwn && !message.deletedForAll) {
      const createdAt = new Date(message.createdAt).getTime();
      const now = Date.now();
      const diffMins = (now - createdAt) / 1000 / 60;
      
      const isRead = message.readAt || (message.seenBy && message.seenBy.length > 0);

      if (diffMins < 3 && !isRead) {
        items.push({
          label: "حذف لدى الجميع",
          icon: <Trash2 size={16} />,
          onClick: () => handleDelete(true),
          variant: 'danger' as const,
          className: 'text-red-600 hover:bg-red-50'
        });
      }
    }

    return items;
  };

  const getStatusIcon = () => {
    if (!isOwn || message._optimistic) return null;
    if (message.readAt) {
      return (
        <Tooltip content="تم القراءة">
          <CheckCheck className="w-4 h-4 text-blue-500" />
        </Tooltip>
      );
    }
    if (message.deliveredAt) {
      return (
        <Tooltip content="تم التسليم">
          <CheckCheck className="w-4 h-4 text-gray-300" />
        </Tooltip>
      );
    }
    return (
      <Tooltip content="تم الإرسال">
        <Check className="w-4 h-4 text-gray-300" />
      </Tooltip>
    );
  };

  // If deleted for all, show placeholder
  if (message.deletedForAll) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
        <div className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-500 italic text-sm flex items-center gap-2">
          <Trash2 size={14} />
          <span>تم حذف هذه الرسالة</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      id={`message-${message._id}`}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 group relative`}
    >
      {/* Avatar for incoming messages */}
      {!isOwn && message.sender && (
        <div className="ml-2 flex-shrink-0">
          <Avatar 
            user={message.sender}
            size="sm"
            showStatus={true}
            statusSize="sm"
          />
        </div>
      )}
      
      <div className={`max-w-[70%] ${isOwn ? 'order-first' : ''} relative group`}>
        {/* Dropdown Menu - Shows on Hover/Click */}
        <div className={`absolute top-2 ${isOwn ? '-right-10' : '-left-10'} opacity-0 group-hover:opacity-100 transition-opacity z-20`}>
          <DropdownMenu 
            items={getDropdownItems()} 
            position={isOwn ? 'left' : 'right'}
            buttonClassName="w-8 h-8 p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 shadow-sm rounded-full transition-colors"
          />
        </div>

        {/* Reply preview */}
        {message.replyTo && (
          <div 
            onClick={() => onReplyClick && onReplyClick(message.replyTo._id)}
            className={`p-2 rounded-t-lg text-xs border-r-3 mb-1 cursor-pointer hover:opacity-80 transition-opacity ${
            isOwn 
              ? 'bg-emerald-100/60 border-emerald-400'
              : 'bg-gray-100 border-gray-400'
          }`}>
            <div className="flex items-center gap-1 mb-0.5">
              <Reply className="w-3 h-3 opacity-70" />
              <span className="font-semibold opacity-90">
                {message.replyTo.sender?.firstName}:
              </span>
            </div>
            <p className="truncate opacity-80">
              {message.replyTo.text?.substring(0, 50)}...
            </p>
          </div>
        )}
        
        {/* Message bubble */}
        <div 
          className={`p-3 rounded-xl shadow-sm transition-all ${
            isOwn 
              ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white' 
              : 'bg-white border border-gray-200'
          } ${message._optimistic ? 'opacity-60 scale-95' : 'opacity-100 scale-100'}`}
        >
          {/* Sender name for group chats */}
          {!isOwn && message.sender && message.chatType === 'GROUP' && (
            <p className="text-xs font-bold mb-2 text-emerald-600 flex items-center gap-1">
              {message.sender.firstName} {message.sender.lastName}
            </p>
          )}
          
          {/* Message text */}
          <p className="whitespace-pre-wrap break-words leading-relaxed">{message.text}</p>
          
          {message.edited && (
            <span className="text-xs opacity-70 italic mr-2 inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              (معدلة)
            </span>
          )}
          
          {/* Time and status */}
          <div className="flex items-center justify-between mt-2 gap-2">
            <span className={`text-xs font-medium ${
              isOwn ? 'text-white/80' : 'text-gray-500'
            }`}>
              {new Date(message.createdAt).toLocaleTimeString('ar', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
            <div className="flex items-center gap-1.5">
              {message._optimistic && (
                <span className={`text-xs flex items-center gap-1 ${
                  isOwn ? 'text-white/70' : 'text-gray-500'
                }`}>
                  <Clock className="w-3 h-3 animate-spin" />
                  جاري الإرسال
                </span>
              )}
              {getStatusIcon()}
            </div>
          </div>
        </div>
        
        {/* Actions */}
        {!message._optimistic && onReply && (
          <button 
            onClick={() => onReply(message)} 
            className="opacity-0 group-hover:opacity-100 transition-all duration-200 mt-1.5 px-2.5 py-1 text-xs text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg flex items-center gap-1 font-medium"
            aria-label="رد على الرسالة"
          >
            <Reply className="w-3 h-3" />
            رد
          </button>
        )}
      </div>
      
      {/* Avatar for outgoing messages */}
      {isOwn && message.sender && (
        <div className="mr-2 flex-shrink-0">
          <Avatar 
            user={message.sender}
            size="sm"
            showStatus={true}
            statusSize="sm"
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(MessageItem);
