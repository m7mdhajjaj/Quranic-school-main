import React, { useEffect, useContext } from 'react';
import { useChat } from '../hooks/useChat';
import { useMessageInput, useMessageOperations, useMessageScroll } from '../hooks';
import { UserStatusContext } from '../../../Context/UserStatusContext';
import MessageItem from './MessageItem';
import { useAuth } from '../../../hooks/useAuth';
import { Button, LoadingSpinner, EmptyState } from '../../../components/UI';
import { Send, Reply, X, Loader2 } from 'lucide-react';

interface ChatWindowProps {
  chatType: 'DM' | 'GROUP';
  targetId: string;
  targetName: string;
  onNewMessage?: (message: any) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatType, targetId, targetName, onNewMessage }) => {
  const { user } = useAuth();
  const { 
    messages, 
    loading,
    loadingMore, 
    hasMore,
    fetchMessages,
    sendMessage, 
    handleTyping,
    typingUsers,
    isTyping
  } = useChat(chatType, targetId);
  
  // Message operations (reply, sending state)
  const { replyTo, setReplyTo, clearReply, isSending, setIsSending } = useMessageOperations();
  
  // Input handling (text, typing indicators, keyboard)
  const { 
    inputText, 
    handleInputChange: handleInputTextChange, 
    handleKeyDown, 
    clearInput,
    canSend
  } = useMessageInput({
    onSend: async (text: string) => {
      setIsSending(true);
      try {
        await sendMessage(text, undefined, replyTo?._id);
        clearInput();
        clearReply();
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
  const { messagesContainerRef, messagesEndRef, handleScroll, loadingMore: showLoadingSpinner } = useMessageScroll({
    messages,
    hasMore,
    loading: loadingMore,
    onLoadMore: (before) => {
      fetchMessages(before);
    }
  });
  
  // Online status
  const statusContext = useContext(UserStatusContext);
  const isOnline = chatType === 'DM' && statusContext ? statusContext.isUserOnline(targetId) : false;

  // Notify parent of new messages
  useEffect(() => {
    if (messages.length > 0 && onNewMessage) {
      const latestMessage = messages[0];
      if (latestMessage.sender?._id !== user?._id) {
        onNewMessage(latestMessage);
      }
    }
  }, [messages, onNewMessage, user]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with Online Status */}
      <div className="p-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-xl flex-1">{targetName}</h3>
          {chatType === 'DM' && (
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
              <div 
                className={`w-2.5 h-2.5 rounded-full ${
                  isOnline ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' : 'bg-gray-300'
                }`}
              />
              <span className="text-sm font-medium">
                {isOnline ? 'متصل الآن' : 'غير متصل'}
              </span>
            </div>
          )}
        </div>
        {isTyping && (
          <p className="text-sm text-white/90 animate-pulse mt-2 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            {typingUsers.length === 1 ? 'يكتب' : `${typingUsers.length} يكتبون`}...
          </p>
        )}
      </div>
      
      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3"
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
        
        {messages.map((msg: any) => (
          <MessageItem 
            key={msg._id || msg.clientTempId} 
            message={msg}
            isOwn={msg.sender?._id === user?._id}
            onReply={setReplyTo}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview */}
      {replyTo && (
        <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-t border-emerald-200 flex justify-between items-center">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Reply className="w-4 h-4 text-emerald-600" />
              <p className="text-xs text-emerald-700 font-semibold">رد على:</p>
            </div>
            <p className="text-sm text-gray-700 truncate">{replyTo.text}</p>
          </div>
          <button 
            onClick={clearReply} 
            className="mr-3 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="إلغاء الرد"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <textarea
              value={inputText}
              onChange={(e) => handleInputTextChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب رسالة..."
              disabled={isSending}
              rows={1}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100 resize-none text-right"
              style={{ maxHeight: '120px' }}
            />
          </div>
          <Button
            onClick={() => {}} // Will be handled by handleKeyDown
            disabled={!canSend || isSending}
            variant="primary"
            size="lg"
            loading={isSending}
            className="h-12 px-6"
            leftIcon={<Send className="w-5 h-5" />}
          >
            إرسال
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
