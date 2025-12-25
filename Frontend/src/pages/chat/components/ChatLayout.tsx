import React, { useState } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import { useChatLayout } from '../hooks';
import { EmptyState } from '../../../components/UI';
import { MessageSquare, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const ChatLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-100 overflow-hidden relative overscroll-none font-sans" dir="rtl">
      {/* Sidebar */}
      <div 
        className={`flex-shrink-0 border-l border-gray-200 bg-white overflow-hidden transition-all duration-300 shadow-lg z-10 ${
          isSidebarOpen ? 'w-80' : 'w-0'
        }`}
      >
        <ChatSidebar 
          conversations={conversations}
          contacts={contacts}
          groups={groups}
          loading={loading} 
          onSelect={handleSelectConversation}
          onStartNewChat={handleStartNewChat}
          selectedId={selectedConversation?._id}
          currentUserId={user?._id || ''}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onDeleteConversation={deleteConversation}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden relative bg-[#f0f2f5]">
        {targetInfo ? (
          <ChatWindow 
            chatType={targetInfo.chatType}
            targetId={targetInfo.targetId}
            targetName={targetInfo.targetName}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onNewMessage={(newMsg) => {
              // Update conversation on new message if needed
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[#f0f2f5] flex-col gap-4">
            <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
               <MessageSquare className="w-16 h-16 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">مرحباً بك في المحادثات</h3>
            <p className="text-gray-500 text-lg">اختر محادثة من القائمة للبدء</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLayout;
