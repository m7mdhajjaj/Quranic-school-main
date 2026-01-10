import React, { useEffect, useState } from 'react';
import { Send, Reply, X, Loader2, MoreVertical, PanelLeftClose, PanelLeftOpen, MessageSquare, ArrowDown, Bell, BellOff } from 'lucide-react';
import { Avatar } from '../../../components/Avatar';
import { DropdownMenu } from '../../../components/UI/DropdownMenu';
import MessageItem from './MessageItem';
import { MentionDropdown } from './MentionDropdown';
import { useChatWindow, useOnlineStatus, useChatHeader, useDateDividers } from '../hooks';
import type { Message } from '../types';

interface ChatWindowProps {
  chatType: 'DM' | 'GROUP';
  targetId: string;
  targetName: string;
  targetAvatar?: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewMessage?: (message: Message) => void;
}

// Separate component for Last Seen to isolate re-renders
const LastSeenDisplay: React.FC<{ lastSeen: string | null; isOnline: boolean }> = ({ lastSeen, isOnline }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (isOnline || !lastSeen) return;
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, [isOnline, lastSeen]);

  if (isOnline) return <span className="text-sm font-medium">متصل الآن</span>;
  if (!lastSeen) return <span className="text-sm font-medium">غير متصل</span>;

  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'منذ لحظات';
    if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
    if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
    return date.toLocaleDateString('ar-EG');
  };

  return <span className="text-sm font-medium">آخر ظهور {formatLastSeen(lastSeen)}</span>;
};

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  chatType, 
  targetId, 
  targetName, 
  targetAvatar, 
  isSidebarOpen, 
  onToggleSidebar, 
  onNewMessage 
}) => {
  // Main chat window logic
  const {
    user,
    uniqueMessages,
    loading,
    showLoadingSpinner,
    showScrollButton,
    replyTo,
    inputText,
    canSend,
    isSending,
    typingUsers,
    isTyping,
    isMentionOpen,
    mentionActiveIndex,
    mentionUsers,
    mentionPosition,
    textareaRef,
    messagesContainerRef,
    messagesEndRef,
    handleReplyCallback,
    handleDeleteCallback,
    handleEditCallback,
    handleReplyClick,
    handleScroll,
    scrollToBottom,
    clearReply,
    onInputChange,
    onKeyDown,
    handleSendWithMentions,
    handleSelectMention
  } = useChatWindow({ chatType, targetId, onNewMessage });

  // Online status
  const { isOnline, lastSeen } = useOnlineStatus(chatType, targetId);

  // Header dropdown items
  const { getHeaderDropdownItems } = useChatHeader(chatType, targetId);

  // Date dividers
  const { shouldShowDateDivider, formatDateDivider } = useDateDividers();

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden relative">
      {/* Header with Online Status */}
      <div className="px-5 py-3.5 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-lg flex justify-between items-center flex-shrink-0 z-20">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={onToggleSidebar}
            className="p-2.5 hover:bg-emerald-50 rounded-xl transition-all duration-200 flex-shrink-0 text-gray-600 hover:text-emerald-600 hover:shadow-sm"
            title={isSidebarOpen ? 'إخفاء القائمة' : 'إظهار القائمة'}
            aria-label={isSidebarOpen ? 'إخفاء القائمة' : 'إظهار القائمة'}
          >
            {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
          </button>
          
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              <Avatar 
                userId={targetId}
                src={targetAvatar}
                userName={targetName}
                size="md"
                showStatus={chatType === 'DM'}
                statusSize="sm"
                className="ring-2 ring-white shadow-md"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-800 truncate flex items-center gap-2">
                {chatType === 'GROUP' && <MessageSquare className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                {targetName}
              </h2>
              
              {/* Online Status for DM */}
              {chatType === 'DM' && !isTyping && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  {isOnline && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
                  <LastSeenDisplay lastSeen={lastSeen} isOnline={isOnline} />
                </div>
              )}
              
              {/* Typing Indicator */}
              {isTyping && typingUsers.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <div className="flex gap-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                  <span>
                    {chatType === 'DM' 
                      ? 'يكتب الآن...' 
                      : typingUsers.length > 1 
                        ? `${typingUsers.length} أشخاص يكتبون...`
                        : 'أحدهم يكتب...'
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <DropdownMenu
            trigger={
              <button 
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 focus:outline-none flex-shrink-0 text-gray-600 hover:text-gray-900 hover:shadow-sm active:scale-95"
                aria-label="خيارات المحادثة"
                title="خيارات المحادثة"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            }
            items={getHeaderDropdownItems().map(item => ({
              ...item,
              icon: item.label.includes('إلغاء') ? <Bell size={16} /> : <BellOff size={16} />
            }))}
            position="bottom-left"
          />
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-hidden relative">
        <div 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto overflow-x-hidden p-5 space-y-5 scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scrollbar-track-transparent overscroll-contain bg-gradient-to-br from-gray-50 via-slate-50/50 to-gray-100/30"
        >
          {showLoadingSpinner && (
            <div className="flex justify-center py-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span className="text-sm text-gray-600">جاري التحميل...</span>
              </div>
            </div>
          )}

          {loading && uniqueMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              </div>
              <p className="text-gray-500 text-lg font-medium">جاري تحميل الرسائل...</p>
            </div>
          )}
        
          {!loading && uniqueMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium">لا توجد رسائل بعد</p>
              <p className="text-gray-400 text-sm">ابدأ المحادثة بإرسال رسالة</p>
            </div>
          )}
        
          {uniqueMessages.map((msg: Message, index: number) => {
            const prevMsg = index > 0 ? uniqueMessages[index - 1] : null;
            const showDivider = shouldShowDateDivider(msg, prevMsg);
            const isOwn = msg.sender?._id === user?._id;

            return (
              <React.Fragment key={msg._id || msg.clientTempId}>
                {showDivider && (
                  <div className="flex justify-center my-4">
                    <div className="px-4 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-600 shadow-sm border border-gray-200/50">
                      {formatDateDivider(msg.createdAt)}
                    </div>
                  </div>
                )}
                <div className="message-observer-target" data-message-id={msg._id}>
                  <MessageItem
                    message={msg}
                    isOwn={isOwn}
                    onReply={handleReplyCallback}
                    onReplyClick={handleReplyClick}
                    onDelete={handleDeleteCallback}
                    onEdit={handleEditCallback}
                  />
                </div>
              </React.Fragment>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <button
            onClick={() => scrollToBottom('smooth')}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-10 hover:scale-110 active:scale-95"
            title="النزول للأسفل"
            aria-label="النزول للأسفل"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Reply Preview */}
      {replyTo && (
        <div className="mx-4 mt-2 p-4 bg-gradient-to-r from-emerald-50 to-white rounded-2xl border-l-4 border-emerald-500 shadow-lg flex justify-between items-center flex-shrink-0 animate-slideUp hover:shadow-xl transition-shadow">
          <div className="flex-1 min-w-0 pr-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Reply className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700">رد على {replyTo.sender.firstName}</span>
            </div>
            <p className="text-sm text-gray-700 truncate font-medium">{replyTo.text}</p>
          </div>
          <button 
            onClick={clearReply} 
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="إلغاء الرد"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white/95 backdrop-blur-md border-t border-gray-200/80 flex-shrink-0 relative z-20 shadow-lg">
        <div className="flex gap-2 items-end bg-white p-2 rounded-xl border border-gray-200/80 focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-100 transition-all shadow-sm relative" dir="rtl">
          <MentionDropdown 
            isOpen={isMentionOpen}
            users={mentionUsers}
            activeIndex={mentionActiveIndex}
            position={mentionPosition}
            onSelect={handleSelectMention}
          />
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={onInputChange}
              onKeyDown={onKeyDown}
              placeholder="اكتب رسالة..."
              disabled={isSending}
              rows={1}
              dir="rtl"
              className="w-full px-2 py-1.5 bg-white border-none focus:ring-0 focus:outline-none resize-none text-right text-gray-900 placeholder-gray-400 max-h-32 text-sm min-h-8"
            />
          </div>
          <button
            onClick={handleSendWithMentions}
            disabled={!canSend || isSending}
            className={`p-2 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
              canSend && !isSending
                ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm hover:shadow-md active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            aria-label="إرسال"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
