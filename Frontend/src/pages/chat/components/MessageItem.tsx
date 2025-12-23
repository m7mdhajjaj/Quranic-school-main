import React, { useState, useRef, useEffect } from 'react';
import { Reply, Check, CheckCheck, Clock, Trash2, Edit3, X, Save } from 'lucide-react';
import { Avatar } from '../../../components/Avatar';
import { Tooltip } from '../../../components/UI';
import { DropdownMenu } from '../../../components/UI/DropdownMenu';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../Api/api';
import { showConfirmMessage, showSuccessMessage, showErrorMessage } from '../../../utils/sweetalertUtils';
import { editMessageSchema } from '../../../Validation/chatValidation';

interface MessageItemProps {
  message: any;
  isOwn: boolean;
  onReply?: (message: any) => void;
  onReplyClick?: (messageId: string) => void;
  onDelete?: (messageId: string, deletedForAll: boolean) => void;
  onEdit?: (messageId: string, newText: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  isOwn, 
  onReply,
  onReplyClick,
  onDelete,
  onEdit
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const [editError, setEditError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditText(message.text);
    setEditError(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(message.text);
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    try {
      // Validate
      const validated = editMessageSchema.parse({ text: editText.trim() });
      
      // Check if text changed
      if (validated.text === message.text) {
        setIsEditing(false);
        return;
      }

      // Save via Socket (through onEdit callback)
      if (onEdit) {
        await onEdit(message._id, validated.text);
        setIsEditing(false);
        setEditError(null);
      }
    } catch (error: any) {
      if (error.errors?.[0]?.message) {
        setEditError(error.errors[0].message);
      } else {
        setEditError(error.response?.data?.message || 'فشل تعديل الرسالة');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

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
    const items = [];

    // Edit option - only for own messages within 5 minutes
    if (isOwn && !message.deletedForAll) {
      const createdAt = new Date(message.createdAt).getTime();
      const now = Date.now();
      const diffMins = (now - createdAt) / 1000 / 60;
      
      if (diffMins < 5) {
        items.push({
          label: 'تعديل',
          icon: <Edit3 size={16} />,
          onClick: handleStartEdit,
          variant: 'default' as const
        });
      }
    }

    // Delete for me
    items.push({
      label: "حذف لديّ",
      icon: <Trash2 size={16} />,
      onClick: () => handleDelete(false),
      variant: 'default' as const
    });

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
          } ${message._optimistic ? 'opacity-60 scale-95' : 'opacity-100 scale-100'} ${
            isEditing ? 'ring-2 ring-emerald-400' : ''
          }`}
        >
          {/* Sender name for group chats */}
          {!isOwn && message.sender && message.chatType === 'GROUP' && (
            <p className="text-xs font-bold mb-2 text-emerald-600 flex items-center gap-1">
              {message.sender.firstName} {message.sender.lastName}
            </p>
          )}
          
          {/* Message text or Edit mode */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                ref={textareaRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`w-full p-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                  isOwn 
                    ? 'bg-white/20 text-white placeholder-white/60' 
                    : 'bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-200'
                }`}
                rows={3}
                maxLength={4000}
                placeholder="اكتب رسالتك..."
              />
              {editError && (
                <p className="text-xs text-red-300 bg-red-900/20 px-2 py-1 rounded">
                  {editError}
                </p>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveEdit}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isOwn
                      ? 'bg-white/20 hover:bg-white/30 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <Save className="w-3 h-3" />
                  حفظ
                </button>
                <button
                  onClick={handleCancelEdit}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isOwn
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  <X className="w-3 h-3" />
                  إلغاء
                </button>
                <span className="text-xs opacity-70 mr-auto">
                  Enter = حفظ • Esc = إلغاء
                </span>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
        
        {/* Actions */}
        {!message._optimistic && !isEditing && onReply && (
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
