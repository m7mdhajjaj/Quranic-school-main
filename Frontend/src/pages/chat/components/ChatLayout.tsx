import React from 'react';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import { useChatLayout } from '../hooks';
import { EmptyState } from '../../../components/UI';
import { MessageSquare } from 'lucide-react';

const ChatLayout: React.FC = () => {
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
    setSearchTerm
  } = useChatLayout();

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-1/4 min-w-[320px] border-l-2 border-gray-200 bg-white shadow-lg">
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
        />
      </div>
      <div className="flex-1 overflow-hidden">
        {targetInfo ? (
          <ChatWindow 
            chatType={targetInfo.chatType}
            targetId={targetInfo.targetId}
            targetName={targetInfo.targetName}
            onNewMessage={(newMsg) => {
              // Update conversation on new message if needed
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <EmptyState
              icon={<MessageSquare className="w-16 h-16 text-emerald-500" />}
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
