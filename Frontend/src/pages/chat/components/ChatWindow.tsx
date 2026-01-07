import React, { useEffect, useContext, useRef, useState, useCallback } from 'react';
import { useChat } from '../hooks/useChat';
import { useMessageInput, useMessageOperations, useMessageScroll } from '../hooks';
import { UserStatusContext } from '../../../Context/UserStatusContext';
import MessageItem from './MessageItem';
import { useAuth } from '../../../hooks/useAuth';
import { Button, LoadingSpinner, EmptyState } from '../../../components/UI';
import { Send, Reply, X, Loader2, MoreVertical, BellOff, Bell, PanelLeftClose, PanelLeftOpen, MessageSquare } from 'lucide-react';
import { DropdownMenu } from '../../../components/UI/DropdownMenu';
import { showSuccessMessage, showErrorMessage } from '../../../utils/sweetalertUtils';
import api from '../../../Api/api';
import { useMentions } from '../../../hooks/useMentions';
import { MentionDropdown } from './MentionDropdown';

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
    editMessage,
    handleTyping,
    typingUsers,
    isTyping,
    markMessageAsRead,
    jumpToMessage,
    handleMessageDeleted
  } = useChat(chatType, targetId);

  // Dedupe messages to prevent key errors
  const uniqueMessages = React.useMemo(() => {
    return messages.filter((msg, index, self) => 
      index === self.findIndex((m) => (
        m._id ? m._id === msg._id : m.clientTempId === msg.clientTempId
      ))
    );
  }, [messages]);

  // Fix passive event listener issue
  useEffect(() => {
    const element = messagesContainerRef.current;
    if (!element) return;

    const handleWheel = (e: WheelEvent) => {
      const atTop = element.scrollTop === 0;
      const atBottom = Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 1;
      
      if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
        e.preventDefault();
      }
    };

    element.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      element.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Mentions Hook
  const [mentions, setMentions] = useState<any[]>([]);
  const {
    isOpen: isMentionOpen,
    query: mentionQuery,
    activeIndex: mentionActiveIndex,
    users: mentionUsers,
    position: mentionPosition,
    triggerIndex: mentionTriggerIndex,
    textareaRef,
    handleChange: handleMentionChange,
    handleKeyDown: handleMentionKeyDown,
    closeMentions
  } = useMentions();

  const handleSelectMention = (user: any | 'all') => {
    if (mentionTriggerIndex === null) return;

    const textBefore = inputText.slice(0, mentionTriggerIndex);
    const textAfter = inputText.slice(textareaRef.current?.selectionStart || 0);
    
    let mentionText = '';
    let newMention = null;

    if (user === 'all') {
      mentionText = '@الجميع ';
      newMention = { type: 'all' };
    } else {
      mentionText = `@${user.firstName} ${user.lastName} `;
      newMention = { type: 'user', user: user._id };
    }

    const newText = textBefore + mentionText + textAfter;
    handleInputTextChange(newText);
    
    // Add to mentions list to be sent with message
    setMentions(prev => [...prev, newMention]);
    
    closeMentions();
    
    // Restore focus and cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = textBefore.length + mentionText.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Override handleSend to include mentions
  const handleSendWithMentions = async () => {
    if (!inputText.trim() && !file) return;
    
    // Filter mentions that are actually still in the text
    const validMentions = mentions.filter(m => {
      if (m.type === 'all') return inputText.includes('@الجميع');
      // For users, it's harder to verify perfectly without unique IDs in text, 
      // but we can check if the name exists. 
      // Ideally, use a unique token in text like @[John Doe](userId) but user asked for simple text.
      // We'll send all collected mentions and let backend validate/filter if needed.
      return true; 
    });

    await handleSend(validMentions);
    setMentions([]); // Clear mentions after send
  };

  // Combined KeyDown Handler
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (isMentionOpen) {
      const handled = handleMentionKeyDown(e);
      if (handled) {
        // If Enter was pressed in mention list
        if (e.key === 'Enter') {
           const selected = mentionUsers.length > 0 
             ? (mentionActiveIndex === 0 ? { _id: 'all', firstName: 'الجميع', lastName: '(All)' } : mentionUsers[mentionActiveIndex - 1])
             : (mentionActiveIndex === 0 ? { _id: 'all', firstName: 'الجميع', lastName: '(All)' } : null);
           
           // Adjust index logic because "All" is first
           const allOption = { _id: 'all', firstName: 'الجميع', lastName: '(All)' };
           const list = [allOption, ...mentionUsers];
           const item = list[mentionActiveIndex];
           
           if (item) handleSelectMention(item._id === 'all' ? 'all' : item);
        }
        return;
      }
    }
    handleKeyDown(e);
  };

  // Combined Change Handler
  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputTextChange(e.target.value);
    handleMentionChange(e);
  };
  
  // Intersection Observer for Read Receipts
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute('data-message-id');
            if (messageId) {
              const message = messages.find(m => m._id === messageId);
              if (message && message.sender?._id !== user?._id) {
                // Check if already read by me
                // For DM: readAt
                // For Group: seenBy array
                const isRead = chatType === 'DM' 
                  ? !!message.readAt 
                  : message.seenBy?.some((s: any) => s.userId === user?._id);
                
                if (!isRead) {
                  markMessageAsRead(messageId);
                }
              }
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    const elements = document.querySelectorAll('.message-observer-target');
    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [messages, markMessageAsRead, user?._id, chatType]);

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
    if (!messages.length || !user) return;

    const unreadMessages = messages.filter((msg: any) => {
      const isFromMe = msg.sender?._id === user._id;
      if (isFromMe) return false;

      // Check if already read by me
      if (chatType === 'DM') {
        return !msg.readAt && !markingReadRef.current.has(msg._id);
      } else {
        // Group: Check if I am in seenBy array
        const seenByMe = msg.seenBy?.some((s: any) => s.userId === user._id);
        return !seenByMe && !markingReadRef.current.has(msg._id);
      }
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
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden relative">
      {/* Header with Online Status */}
      <div className="px-5 py-3.5 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-lg flex justify-between items-center flex-shrink-0 z-20">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={onToggleSidebar}
            className="p-2.5 hover:bg-emerald-50 rounded-xl transition-all duration-200 flex-shrink-0 text-gray-600 hover:text-emerald-600 hover:shadow-sm"
            title={isSidebarOpen ? 'إخفاء القائمة' : 'إظهار القائمة'}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="w-5 h-5" />
            ) : (
              <PanelLeftOpen className="w-5 h-5" />
            )}
          </button>
          
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-lg shadow-md ring-2 ring-white">
                {targetName.charAt(0)}
              </div>
              {chatType === 'DM' && isOnline && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full animate-pulse shadow-sm"></div>
              )}
            </div>
            
            <div className="flex flex-col min-w-0">
              <h3 className="font-bold text-gray-900 truncate text-base leading-tight">{targetName}</h3>
              
              {chatType === 'DM' ? (
                <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <LastSeenDisplay lastSeen={lastSeen} isOnline={isOnline} />
                </div>
              ) : (
                <div className="text-xs text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  محادثة جماعية
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isTyping && (
            <div className="px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md border border-emerald-200 animate-bounce-slow">
              <div className="flex gap-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
              </div>
              <span className="hidden sm:inline">{typingUsers.length === 1 ? 'يكتب' : `${typingUsers.length} يكتبون`}...</span>
            </div>
          )}

          <DropdownMenu
            trigger={
              <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 focus:outline-none flex-shrink-0 text-gray-600 hover:text-gray-900 hover:shadow-sm active:scale-95">
                <MoreVertical className="w-5 h-5" />
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
        className="flex-1 overflow-y-auto overflow-x-hidden p-5 space-y-5 scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scrollbar-track-transparent overscroll-contain bg-gradient-to-br from-gray-50 via-slate-50/50 to-gray-100/30"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(203, 213, 225, 0.15) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      >
        {/* Loading Spinner for Pagination */}
        {showLoadingSpinner && (
          <div className="flex justify-center items-center py-4 animate-fadeIn">
            <div className="bg-gradient-to-r from-emerald-50 to-white backdrop-blur-md px-5 py-3 rounded-full shadow-lg border border-emerald-200/50 flex items-center gap-2">
               <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
               <span className="text-xs font-semibold text-emerald-700">جاري التحميل...</span>
            </div>
          </div>
        )}

        {loading && uniqueMessages.length === 0 && (
          <div className="text-center py-16 animate-fadeIn">
            <div className="inline-flex flex-col items-center p-6 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl mb-4 border border-gray-100">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-emerald-100 rounded-full animate-pulse"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-emerald-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-700 mt-4 font-bold text-base">جاري تحميل الرسائل...</p>
              <p className="text-gray-500 text-xs mt-1">يرجى الانتظار</p>
            </div>
          </div>
        )}
        
        {!loading && uniqueMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-28 h-28 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-3xl flex items-center justify-center mb-5 shadow-lg ring-4 ring-emerald-50">
              <MessageSquare className="w-12 h-12 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">لا توجد رسائل بعد</h3>
            <p className="text-gray-500 text-center max-w-xs">ابدأ المحادثة بإرسال رسالة ترحيب 👋</p>
          </div>
        )}
        
        {uniqueMessages.map((msg: any, index: number) => {
          const showDivider = shouldShowDateDivider(msg, uniqueMessages[index - 1]);
          return (
            <React.Fragment key={msg._id || msg.clientTempId}>
              {showDivider && (
                <div className="flex justify-center my-6 sticky top-2 z-10">
                  <span className="bg-white/95 backdrop-blur-md text-gray-700 text-xs font-semibold px-5 py-2 rounded-full shadow-md border border-gray-200/50 hover:shadow-lg transition-shadow">
                    {formatDateDivider(msg.createdAt)}
                  </span>
                </div>
              )}
              <div data-message-id={msg._id} className="message-observer-target">
                <MessageItem 
                  message={msg}
                  isOwn={msg.sender?._id === user?._id}
                  onReply={setReplyTo}
                  onReplyClick={handleReplyClick}
                  onDelete={handleMessageDeleted}
                  onEdit={editMessage}
                />
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview */}
      {replyTo && (
        <div className="mx-4 mt-2 p-4 bg-gradient-to-r from-emerald-50 to-white rounded-2xl border-l-4 border-emerald-500 shadow-lg flex justify-between items-center flex-shrink-0 animate-slideUp hover:shadow-xl transition-shadow">
          <div className="flex-1 min-w-0 pr-3">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1 bg-emerald-100 rounded-full">
                <Reply className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <p className="text-xs text-emerald-800 font-bold">رد على رسالة</p>
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
        <MentionDropdown 
          isOpen={isMentionOpen}
          users={mentionUsers}
          activeIndex={mentionActiveIndex}
          position={mentionPosition}
          onSelect={handleSelectMention}
        />
        <div className="flex gap-3 items-end bg-gradient-to-br from-gray-50 to-white p-3 rounded-2xl border border-gray-200 focus-within:ring-2 focus-within:ring-emerald-400/30 focus-within:border-emerald-400 transition-all shadow-md hover:shadow-lg">
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={onInputChange}
              onKeyDown={onKeyDown}
              placeholder="اكتب رسالة..."
              disabled={isSending}
              rows={1}
              className="w-full p-3 bg-transparent border-none focus:ring-0 resize-none text-right text-gray-800 placeholder-gray-400 max-h-32 font-medium"
              style={{ minHeight: '44px' }}
            />
          </div>
          <button
            onClick={handleSendWithMentions}
            disabled={!canSend || isSending}
            className={`p-3.5 rounded-full flex items-center justify-center transition-all duration-200 ${
              canSend && !isSending
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600 shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSending ? (
              <div className="relative">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : (
              <Send className="w-5 h-5 ml-0.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
