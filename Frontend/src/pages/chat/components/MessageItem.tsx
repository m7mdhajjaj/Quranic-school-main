import React from 'react';
import { Reply, Check, CheckCheck, Clock } from 'lucide-react';
import { Avatar } from '../../../components/Avatar';
import { Tooltip } from '../../../components/UI';

interface MessageItemProps {
  message: any;
  isOwn: boolean;
  onReply?: (message: any) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  isOwn, 
  onReply
}) => {
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

  return (
    <div 
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 group`}
    >
      {/* Avatar for incoming messages */}
      {!isOwn && message.sender && (
        <div className="mr-2 flex-shrink-0">
          <Avatar 
            user={message.sender}
            size="sm"
            showStatus={true}
            statusSize="sm"
          />
        </div>
      )}
      
      <div className={`max-w-[70%] ${isOwn ? 'order-first' : ''}`}>
        {/* Reply preview */}
        {message.replyTo && (
          <div className={`p-2.5 rounded-t-xl text-xs border-r-4 mb-1 ${
            isOwn 
              ? 'bg-emerald-100/50 border-emerald-400'
              : 'bg-gray-100 border-gray-400'
          }`}>
            <div className="flex items-center gap-1 mb-1">
              <Reply className="w-3 h-3 opacity-60" />
              <span className="font-semibold opacity-80">
                {message.replyTo.sender?.firstName}:
              </span>
            </div>
            <p className="truncate opacity-75">
              {message.replyTo.text?.substring(0, 50)}...
            </p>
          </div>
        )}
        
        {/* Message bubble */}
        <div 
          className={`p-3.5 rounded-2xl shadow-md transition-all ${
            isOwn 
              ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white' 
              : 'bg-white border-2 border-gray-100 hover:border-gray-200'
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
            <span className="text-xs opacity-70 italic ml-2 inline-flex items-center gap-1">
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
            className="opacity-0 group-hover:opacity-100 transition-all duration-200 mt-2 px-3 py-1.5 text-xs text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-emerald-500 hover:to-teal-500 rounded-lg flex items-center gap-1.5 font-medium"
            aria-label="رد على الرسالة"
          >
            <Reply className="w-3.5 h-3.5" />
            رد
          </button>
        )}
      </div>
      
      {/* Avatar for outgoing messages */}
      {isOwn && message.sender && (
        <div className="ml-2 flex-shrink-0">
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

export default MessageItem;
