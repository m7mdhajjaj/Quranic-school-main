import React, { useState, useEffect, memo } from 'react';
import { ArrowRight, Search, MessageSquare, X } from 'lucide-react';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import { useChatLayout } from '../hooks';
import type { Conversation } from '../types';

type MobileView = 'conversations' | 'chat';

const MobileChatLayout: React.FC = () => {
  const [currentView, setCurrentView] = useState<MobileView>('conversations');
  const [showSearch, setShowSearch] = useState(false);
  
  const {
    conversations,
    contacts,
    groups,
    selectedConversation,
    targetInfo,
    user,
    loading,
    handleSelectConversation,
    handleStartNewChat,
    searchTerm,
    setSearchTerm,
    deleteConversation
  } = useChatLayout();

  // Reset to conversations view when no conversation is selected
  useEffect(() => {
    if (!selectedConversation && currentView === 'chat') {
      setCurrentView('conversations');
    }
  }, [selectedConversation, currentView]);

  // Handle conversation selection
  const handleMobileSelectConversation = (conv: Conversation) => {
    handleSelectConversation(conv);
    setCurrentView('chat');
  };

  // Handle back button
  const handleBack = () => {
    setCurrentView('conversations');
    setShowSearch(false);
  };

  // Handle new chat - just navigate to conversations for now
  const handleNewChat = () => {
    // For now, just show a message or navigate somewhere
    // In a full implementation, you'd show a contact picker modal
    console.log('Start new chat');
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-100 overflow-hidden relative" dir="rtl">
      {/* Mobile Header - Shows in conversations view */}
      {currentView === 'conversations' && (
        <div className="flex-shrink-0 bg-emerald-600 text-white px-4 py-3 shadow-lg z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6" />
              <h1 className="text-xl font-bold">المحادثات</h1>
            </div>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 hover:bg-emerald-700 rounded-lg transition-colors"
              aria-label="بحث"
            >
              {showSearch ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Search Bar */}
          {showSearch && (
            <div className="mt-3 animate-slideDown">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث عن محادثة..."
                className="w-full px-4 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                dir="rtl"
              />
            </div>
          )}
        </div>
      )}

      {/* Chat Header - Shows in chat view */}
      {currentView === 'chat' && targetInfo && (
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 shadow-sm z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="رجوع"
            >
              <ArrowRight className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-800 truncate">
                {targetInfo.targetName}
              </h2>
              <p className="text-xs text-gray-500">
                {targetInfo.chatType === 'GROUP' ? 'مجموعة' : 'محادثة'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        {/* Conversations List View */}
        <div
          className={`absolute inset-0 bg-white transition-transform duration-300 ease-in-out ${
            currentView === 'conversations' ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <ChatSidebar
            conversations={conversations}
            contacts={contacts}
            groups={groups}
            loading={loading}
            onSelect={handleMobileSelectConversation}
            onStartNewChat={handleStartNewChat}
            selectedId={selectedConversation?._id}
            currentUserId={user?._id || ''}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onDeleteConversation={deleteConversation}
          />
        </div>

        {/* Chat View */}
        <div
          className={`absolute inset-0 bg-gray-50 transition-transform duration-300 ease-in-out ${
            currentView === 'chat' ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {targetInfo ? (
            <ChatWindow
              chatType={targetInfo.chatType}
              targetId={targetInfo.targetId}
              targetName={targetInfo.targetName}
              targetAvatar={targetInfo.targetAvatar}
              isSidebarOpen={false}
              onToggleSidebar={handleBack}
              onNewMessage={() => {
                // Update conversation on new message if needed
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-50 flex-col gap-4 px-6">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center animate-pulse">
                <MessageSquare className="w-12 h-12 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 text-center">
                لا توجد محادثة محددة
              </h3>
              <p className="text-gray-500 text-center">
                اختر محادثة من القائمة للبدء
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button - Shows in conversations view */}
      {currentView === 'conversations' && (
        <button
          onClick={handleNewChat}
          className="fixed bottom-6 left-6 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center z-30 active:scale-95"
          aria-label="محادثة جديدة"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default memo(MobileChatLayout);
