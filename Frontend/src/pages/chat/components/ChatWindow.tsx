import React, { useEffect, useContext, useRef, useState, useCallback } from 'react';
import { useChat } from '../hooks/useChat';
import { useMessageInput, useMessageOperations, useMessageScroll } from '../hooks';
import { UserStatusContext } from '../../../Context/UserStatusContext';
import MessageItem from './MessageItem';
import { useAuth } from '../../../hooks/useAuth';
import { Button, LoadingSpinner, EmptyState } from '../../../components/UI';
import { Send, Reply, X, Loader2, MoreVertical, BellOff, Bell, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { DropdownMenu } from '../../../components/UI/DropdownMenu';
import { showSuccessMessage, showErrorMessage } from '../../../utils/sweetalertUtils';
import api from '../../../Api/api';

interface ChatWindowProps {
  chatType: 'DM' | 'GROUP';
  targetId: string;
  targetName: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewMessage?: (message: any) => void;
}

// Separate component for Last Seen to isolate re-renders
const LastSeenDisplay: React.FC<{ lastSeen: string | null; isOnline: boolean }> = ({ lastSeen, isOnline }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (isOnline || !lastSeen) return;
    // Update every minute to refresh "X minutes ago" text
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

const ChatWindow: React.FC<ChatWindowProps> = ({ chatType, targetId, targetName, isSidebarOpen, onToggleSidebar, onNewMessage }) => {
  const { user } = useAuth();
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const { 
    messages, 
    loading,
    loadingMore, 
    hasMore,
    fetchMessages,
    sendMessage, 
    handleTyping,
    typingUsers,
    isTyping,
    markMessageAsRead,
    jumpToMessage,
    handleMessageDeleted
  } = useChat(chatType, targetId);
  
  // Message operations (reply, sending state)
  const { replyTo, setReplyTo, clearReply, isSending, setIsSending } = useMessageOperations();
  
  // Input handling (text, typing indicators, keyboard)
  const { 
    inputText, 
    handleInputChange: handleInputTextChange, 
    handleKeyDown, 
    handleSend,
    clearInput,
    canSend
  } = useMessageInput({
    onSend: async (text: string) => {
      setIsSending(true);
      try {
        await sendMessage(text, undefined, replyTo?._id);
        clearInput();
        clearReply();
        // Scroll to bottom after sending with smooth animation
        requestAnimationFrame(() => {
          setTimeout(() => scrollToBottom('smooth'), 50);
        });
      } catch (err) {
        console.error("Failed to send message:", err);
      } finally {
        setIsSending(false);
      }
    },
    onTyping: handleTyping,
    maxLength: 1000
  });
  
  // Scroll management (auto-scroll, pagination)
  const { messagesContainerRef, messagesEndRef, handleScroll, scrollToBottom, loadingMore: showLoadingSpinner } = useMessageScroll({
    messages,
    hasMore,
    loading: loadingMore,
    onLoadMore: (before) => {
      fetchMessages(before);
    }
  });
  
  // Online status
  const statusContext = useContext(UserStatusContext);
  const userStatus = chatType === 'DM' && statusContext ? statusContext.getUserStatus(targetId) : null;
  const isOnline = userStatus?.isActive || false;

  // Fetch Last Seen
  useEffect(() => {
    if (chatType === 'DM' && targetId && !isOnline) {
      // Use context timestamp immediately if available (Real-time update)
      if (userStatus?.timestamp && !userStatus.isActive) {
        setLastSeen(userStatus.timestamp);
      }

      const fetchLastSeen = async () => {
        try {
          const res = await api.get(`/users/${targetId}/status`);
          if (res.data?.lastSeen) {
            setLastSeen((prev) => {
              // If we have no previous value, accept the new one
              if (!prev) return res.data.lastSeen;
              
              // Compare timestamps to ensure we don't show an older value
              const prevTime = new Date(prev).getTime();
              const newTime = new Date(res.data.lastSeen).getTime();
              
              // Only update if the new time is newer or equal
              return newTime >= prevTime ? res.data.lastSeen : prev;
            });
          }
        } catch (err) {
          console.error("Failed to fetch last seen:", err);
        }
      };
      
      fetchLastSeen();
      
      // Poll for updates every 30 seconds
      const pollInterval = setInterval(fetchLastSeen, 30000);
      return () => clearInterval(pollInterval);
    } else {
      setLastSeen(null);
    }
  }, [chatType, targetId, isOnline, userStatus?.timestamp, userStatus?.isActive]);

  // Date Divider Helper
  const shouldShowDateDivider = (currentMsg: any, prevMsg: any) => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.createdAt).toDateString();
    const prevDate = new Date(prevMsg.createdAt).toDateString();
    return currentDate !== prevDate;
  };

  const formatDateDivider = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'اليوم';
    if (date.toDateString() === yesterday.toDateString()) return 'أمس';
    return date.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Track messages being marked as read to avoid duplicates
  const markingReadRef = useRef<Set<string>>(new Set());

  // Mark unread messages as read
  useEffect(() => {
    if (!messages.length || !user || chatType !== 'DM') return;

    const unreadMessages = messages.filter((msg: any) => {
      const isFromMe = msg.sender?._id === user._id;
      if (isFromMe) return false;
      return !msg.readAt && !markingReadRef.current.has(msg._id);
    });

    if (unreadMessages.length > 0) {
      unreadMessages.forEach((msg: any) => {
        markingReadRef.current.add(msg._id);
        markMessageAsRead(msg._id);
      });
    }
  }, [messages, user, chatType, markMessageAsRead]);

  // Notify parent of new messages
  useEffect(() => {
    if (messages.length > 0 && onNewMessage) {
      const latestMessage = messages[0];
      if (latestMessage.sender?._id !== user?._id) {
        onNewMessage(latestMessage);
      }
    }
  }, [messages, onNewMessage, user]);

  // Handle scrolling to replied message
  const handleReplyClick = useCallback(async (messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    
    if (element) {
      // Case 1: Message is already loaded
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('bg-yellow-50/50', 'transition-colors', 'duration-1000');
      setTimeout(() => {
        element.classList.remove('bg-yellow-50/50', 'transition-colors', 'duration-1000');
      }, 2000);
    } else {
      // Case 2: Message is not loaded (fetch context)
      try {
        await jumpToMessage(messageId);
        // Wait for render then scroll
        setTimeout(() => {
          const newElement = document.getElementById(`message-${messageId}`);
          if (newElement) {
            newElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            newElement.classList.add('bg-yellow-50/50', 'transition-colors', 'duration-1000');
            setTimeout(() => {
              newElement.classList.remove('bg-yellow-50/50', 'transition-colors', 'duration-1000');
            }, 2000);
          }
        }, 100);
      } catch (err) {
        console.error("Failed to jump to message:", err);
      }
    }
  }, [jumpToMessage]);

  const handleMute = async (duration: number) => {
    try {
      await api.post('/chat/conversations/mute', {
        chatType,
        targetId,
        duration
      });
      showSuccessMessage("تم", duration === 0 ? "تم إلغاء كتم الإشعارات" : "تم كتم الإشعارات بنجاح");
    } catch (err) {
      showErrorMessage("خطأ", "فشل تحديث إعدادات الإشعارات");
    }
  };

  const getHeaderDropdownItems = () => [
    {
      label: "كتم لمدة ساعة",
      icon: <BellOff size={16} />,
      onClick: () => handleMute(60),
    },
    {
      label: "كتم لمدة يوم",
      icon: <BellOff size={16} />,
      onClick: () => handleMute(24 * 60),
    },
    {
      label: "كتم دائماً",
      icon: <BellOff size={16} />,
      onClick: () => handleMute(-1),
    },
    {
      label: "إلغاء الكتم",
      icon: <Bell size={16} />,
      onClick: () => handleMute(0),
    }
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Header with Online Status */}
      <div className="p-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white shadow-md flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
            title={isSidebarOpen ? 'إخفاء القائمة' : 'إظهار القائمة'}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="w-5 h-5" />
            ) : (
              <PanelLeftOpen className="w-5 h-5" />
            )}
          </button>
          
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h3 className="font-bold text-lg truncate">{targetName}</h3>
            
            {chatType === 'DM' && (
              <div className="flex items-center gap-1.5 bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/30 flex-shrink-0">
                <div 
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-300'
                  }`}
                />
                <LastSeenDisplay lastSeen={lastSeen} isOnline={isOnline} />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {isTyping && (
            <p className="text-sm text-white/90 animate-pulse flex items-center gap-1.5">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">{typingUsers.length === 1 ? 'يكتب' : `${typingUsers.length} يكتبون`}...</span>
            </p>
          )}

          <DropdownMenu
            trigger={
              <button className="p-1.5 hover:bg-white/20 rounded-full transition-colors focus:outline-none flex-shrink-0">
                <MoreVertical className="w-5 h-5 text-white" />
              </button>
            }
            items={getHeaderDropdownItems()}
            position="bottom-left"
          />
        </div>
      </div>
      
      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-2 scroll-smooth scrollbar-hide"
      >
        {/* Loading Spinner for Pagination */}
        {showLoadingSpinner && (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
          </div>
        )}

        {loading && messages.length === 0 && (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" />
            <p className="text-gray-500 mt-2">جاري التحميل...</p>
          </div>
        )}
        
        {!loading && messages.length === 0 && (
          <EmptyState
            icon="💬"
            title="لا توجد رسائل بعد"
            description="ابدأ محادثة جديدة وأرسل أول رسالة"
          />
        )}
        
        {messages.map((msg: any, index: number) => {
          const showDivider = shouldShowDateDivider(msg, messages[index - 1]);
          return (
            <React.Fragment key={msg._id || msg.clientTempId}>
              {showDivider && (
                <div className="flex justify-center my-3">
                  <span className="bg-white text-gray-600 text-xs px-3 py-1 rounded-full shadow-sm border border-gray-200">
                    {formatDateDivider(msg.createdAt)}
                  </span>
                </div>
              )}
              <MessageItem 
                message={msg}
                isOwn={msg.sender?._id === user?._id}
                onReply={setReplyTo}
                onReplyClick={handleReplyClick}
                onDelete={handleMessageDeleted}
              />
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview */}
      {replyTo && (
        <div className="px-4 py-2.5 bg-emerald-50 border-t border-emerald-100 flex justify-between items-center flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Reply className="w-3.5 h-3.5 text-emerald-600" />
              <p className="text-xs text-emerald-700 font-semibold">رد على:</p>
            </div>
            <p className="text-sm text-gray-700 truncate">{replyTo.text}</p>
          </div>
          <button 
            onClick={clearReply} 
            className="mr-3 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="إلغاء الرد"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
        <div className="flex gap-2.5 items-end">
          <div className="flex-1 min-w-0">
            <textarea
              value={inputText}
              onChange={(e) => handleInputTextChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب رسالة..."
              disabled={isSending}
              rows={1}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100 resize-none text-right"
              style={{ maxHeight: '120px' }}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!canSend || isSending}
            variant="primary"
            size="lg"
            loading={isSending}
            className="h-12 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            leftIcon={<Send className="w-4 h-4" />}
          >
            إرسال
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
