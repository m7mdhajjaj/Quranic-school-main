import React, { useEffect, useState, useMemo, memo, Suspense, lazy } from 'react';
import { Send, Reply, X, Loader2, MoreVertical, PanelLeftClose, PanelLeftOpen, MessageSquare, ArrowDown, Bell, BellOff } from 'lucide-react';
import { Avatar } from '../../../components/Avatar';
import { DropdownMenu } from '../../../components/UI/DropdownMenu';
import { MessageSkeleton } from './MessageSkeleton';
import { useChatWindow, useOnlineStatus, useChatHeader, useDateDividers } from '../hooks';
import type { Message } from '../types';

// Lazy load heavy components for better LCP
const MessageItem = lazy(() => import('./MessageItem'));
const MentionDropdown = lazy(() => import('./MentionDropdown').then(m => ({ default: m.MentionDropdown })));

interface ChatWindowProps {
  chatType: 'DM' | 'GROUP';
  targetId: string;
  targetName: string;
  targetAvatar?: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewMessage?: (message: Message) => void;
}

// Format last seen with memoization
const formatLastSeen = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'منذ لحظات';
  if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
  if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
  return date.toLocaleDateString('ar-EG');
};

// Memoized Last Seen Display
const LastSeenDisplay = memo<{ lastSeen: string | null; isOnline: boolean }>(({ lastSeen, isOnline }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (isOnline || !lastSeen) return;
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, [isOnline, lastSeen]);

  const displayText = useMemo(() => {
    if (isOnline) return 'متصل الآن';
    if (!lastSeen) return 'غير متصل';
    return `آخر ظهور ${formatLastSeen(lastSeen)}`;
  }, [isOnline, lastSeen]);

  return <span className="text-xs sm:text-sm font-medium truncate">{displayText}</span>;
});

LastSeenDisplay.displayName = 'LastSeenDisplay';

// Memoized Typing Indicator
const TypingIndicator = memo<{ chatType: 'DM' | 'GROUP'; typingCount: number }>(({ chatType, typingCount }) => (
  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
    <div className="flex gap-0.5">
      <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0ms]" />
      <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:150ms]" />
      <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:300ms]" />
    </div>
    <span className="hidden sm:inline truncate">
      {chatType === 'DM' 
        ? 'يكتب الآن...' 
        : typingCount > 1 
          ? `${typingCount} أشخاص يكتبون...`
          : 'أحدهم يكتب...'
      }
    </span>
  </div>
));

TypingIndicator.displayName = 'TypingIndicator';

// Memoized Header
const ChatHeader = memo<{
  chatType: 'DM' | 'GROUP';
  targetId: string;
  targetName: string;
  targetAvatar?: string;
  isSidebarOpen: boolean;
  isOnline: boolean;
  lastSeen: string | null;
  isTyping: boolean;
  typingCount: number;
  onToggleSidebar: () => void;
  getHeaderDropdownItems: () => any[];
}>(({ 
  chatType, 
  targetId, 
  targetName, 
  targetAvatar, 
  isSidebarOpen, 
  isOnline, 
  lastSeen, 
  isTyping, 
  typingCount, 
  onToggleSidebar,
  getHeaderDropdownItems 
}) => {
  const dropdownItems = useMemo(() => 
    getHeaderDropdownItems().map(item => ({
      ...item,
      icon: item.label.includes('إلغاء') ? <Bell size={16} /> : <BellOff size={16} />
    })),
    [getHeaderDropdownItems]
  );

  return (
    <div className="px-3 sm:px-5 py-2.5 sm:py-3.5 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-sm flex justify-between items-center flex-shrink-0 z-20">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 sm:p-2.5 hover:bg-emerald-50 rounded-xl transition-all duration-200 flex-shrink-0 text-gray-600 hover:text-emerald-600"
          title={isSidebarOpen ? 'إخفاء القائمة' : 'إظهار القائمة'}
          aria-label={isSidebarOpen ? 'إخفاء القائمة' : 'إظهار القائمة'}
        >
          {isSidebarOpen ? <PanelLeftClose className="w-4 h-4 sm:w-5 sm:h-5" /> : <PanelLeftOpen className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>
        
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <Avatar 
            userId={targetId}
            src={targetAvatar}
            userName={targetName}
            size="sm"
            showStatus={chatType === 'DM'}
            statusSize="sm"
            className="ring-2 ring-white shadow-sm w-8 h-8 sm:w-10 sm:h-10"
          />
          
          <div className="flex-1 min-w-0">
            <h2 className="text-sm sm:text-lg font-bold text-gray-800 truncate flex items-center gap-1 sm:gap-2">
              {chatType === 'GROUP' && <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 flex-shrink-0" />}
              <span className="truncate">{targetName}</span>
            </h2>
            
            {chatType === 'DM' && !isTyping && (
              <div className="flex items-center gap-1 text-xs text-gray-500 min-w-0">
                {isOnline && <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full animate-pulse flex-shrink-0" />}
                <LastSeenDisplay lastSeen={lastSeen} isOnline={isOnline} />
              </div>
            )}
            
            {isTyping && <TypingIndicator chatType={chatType} typingCount={typingCount} />}
          </div>
        </div>
      </div>

      <DropdownMenu
        trigger={
          <button 
            className="p-1.5 sm:p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 focus:outline-none flex-shrink-0 text-gray-600 hover:text-gray-900 active:scale-95"
            aria-label="خيارات المحادثة"
          >
            <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        }
        items={dropdownItems}
        position="bottom-left"
      />
    </div>
  );
});

ChatHeader.displayName = 'ChatHeader';

// Memoized Reply Preview
const ReplyPreview = memo<{ replyTo: Message; onClear: () => void }>(({ replyTo, onClear }) => (
  <div className="mx-3 sm:mx-4 mt-2 p-3 sm:p-4 bg-gradient-to-r from-emerald-50 to-white rounded-2xl border-l-4 border-emerald-500 shadow-lg flex justify-between items-center flex-shrink-0">
    <div className="flex-1 min-w-0 pr-2 sm:pr-3">
      <div className="flex items-center gap-2 mb-1">
        <Reply className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 flex-shrink-0" />
        <span className="text-xs font-bold text-emerald-700 truncate">رد على {replyTo.sender.firstName}</span>
      </div>
      <p className="text-xs sm:text-sm text-gray-700 truncate font-medium">{replyTo.text}</p>
    </div>
    <button 
      onClick={onClear} 
      className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200 flex-shrink-0"
      aria-label="إلغاء الرد"
    >
      <X className="w-4 h-4 sm:w-5 sm:h-5" />
    </button>
  </div>
));

ReplyPreview.displayName = 'ReplyPreview';

// Memoized Date Divider
const DateDivider = memo<{ date: string }>(({ date }) => (
  <div className="flex justify-center my-3 sm:my-4">
    <div className="px-3 sm:px-4 py-1 sm:py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-600 shadow-sm border border-gray-200/50">
      {date}
    </div>
  </div>
));

DateDivider.displayName = 'DateDivider';

// Optimized Empty State with faster rendering
const EmptyState = memo<{ loading: boolean }>(({ loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 sm:gap-4" role="status" aria-live="polite">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-100 rounded-full flex items-center justify-center">
          <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 animate-spin text-emerald-600" />
        </div>
        <p className="text-gray-600 text-sm font-medium">تحميل...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 sm:gap-4 px-4">
      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center">
        <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
      </div>
      <p className="text-gray-600 text-sm sm:text-base font-medium">لا توجد رسائل</p>
      <p className="text-gray-400 text-xs">ابدأ المحادثة</p>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

// Main Component
const ChatWindow: React.FC<ChatWindowProps> = ({ 
  chatType, 
  targetId, 
  targetName, 
  targetAvatar, 
  isSidebarOpen, 
  onToggleSidebar, 
  onNewMessage 
}) => {
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

  const { isOnline, lastSeen } = useOnlineStatus(chatType, targetId);
  const { getHeaderDropdownItems } = useChatHeader(chatType, targetId);
  const { shouldShowDateDivider, formatDateDivider } = useDateDividers();

  const typingCount = useMemo(() => typingUsers.length, [typingUsers.length]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden relative">
      <ChatHeader
        chatType={chatType}
        targetId={targetId}
        targetName={targetName}
        targetAvatar={targetAvatar}
        isSidebarOpen={isSidebarOpen}
        isOnline={isOnline}
        lastSeen={lastSeen}
        isTyping={isTyping}
        typingCount={typingCount}
        onToggleSidebar={onToggleSidebar}
        getHeaderDropdownItems={getHeaderDropdownItems}
      />
      
      {/* Messages */}
      <div className="flex-1 overflow-hidden relative">
        <div 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto overflow-x-hidden p-3 sm:p-5 space-y-3 sm:space-y-5 scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scrollbar-track-transparent overscroll-contain bg-gradient-to-br from-gray-50 via-slate-50/50 to-gray-100/30"
        >
          {showLoadingSpinner && (
            <div className="flex justify-center py-3 sm:py-4">
              <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white rounded-full shadow-sm">
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-emerald-600" />
                <span className="text-xs sm:text-sm text-gray-600">جاري التحميل...</span>
              </div>
            </div>
          )}

          {uniqueMessages.length === 0 ? (
            <EmptyState loading={loading} />
          ) : (
            <Suspense fallback={<MessageSkeleton />}>
              {uniqueMessages.map((msg: Message, index: number) => {
                const prevMsg = index > 0 ? uniqueMessages[index - 1] : null;
                const showDivider = shouldShowDateDivider(msg, prevMsg);
                const isOwn = msg.sender?._id === user?._id;

                return (
                  <React.Fragment key={msg._id || msg.clientTempId}>
                    {showDivider && <DateDivider date={formatDateDivider(msg.createdAt)} />}
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
            </Suspense>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {showScrollButton && (
          <button
            onClick={() => scrollToBottom('smooth')}
            className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 bg-emerald-500 hover:bg-emerald-600 text-white p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-10 hover:scale-110 active:scale-95"
            title="النزول للأسفل"
            aria-label="النزول للأسفل"
          >
            <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
      </div>

      {replyTo && <ReplyPreview replyTo={replyTo} onClear={clearReply} />}

      {/* Input */}
      <div className="p-2 sm:p-4 bg-white/95 backdrop-blur-md border-t border-gray-200/80 flex-shrink-0 relative z-20 shadow-sm">
        <div className="flex gap-1.5 sm:gap-2 items-end bg-white p-1.5 sm:p-2 rounded-xl border border-gray-200/80 focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-100 transition-all shadow-sm relative" dir="rtl">
          <Suspense fallback={null}>
            <MentionDropdown 
            isOpen={isMentionOpen}
            users={mentionUsers}
            activeIndex={mentionActiveIndex}
            position={mentionPosition}
            onSelect={handleSelectMention}
          />
          </Suspense>
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
              className="w-full px-2 py-1 sm:py-1.5 bg-white border-none focus:ring-0 focus:outline-none resize-none text-right text-gray-900 placeholder-gray-400 max-h-24 sm:max-h-32 text-xs sm:text-sm min-h-6 sm:min-h-8"
            />
          </div>
          <button
            onClick={handleSendWithMentions}
            disabled={!canSend || isSending}
            className={`p-1.5 sm:p-2 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
              canSend && !isSending
                ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm hover:shadow-md active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            aria-label="إرسال"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : (
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(ChatWindow);
