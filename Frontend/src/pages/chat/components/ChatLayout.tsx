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
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 overflow-hidden relative overscroll-none" dir="rtl">
      {/* Sidebar */}
      <div 
        className={`flex-shrink-0 border-l border-gray-200 bg-white overflow-hidden transition-all duration-300 ${
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
      <div className="flex-1 overflow-hidden">
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
          <div className="flex h-full items-center justify-center bg-gray-50">
            <EmptyState
              icon={<MessageSquare className="w-20 h-20 text-emerald-500" />}
              title="اختر محادثة للبدء"
              description="اختر محادثة من القائمة أو ابدأ محادثة جديدة"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLayout;
