import React, { useState, useCallback } from 'react';
import { Avatar } from '../../../components/Avatar';
import { EmptyState, LoadingSpinner, Badge } from '../../../components/UI';
import { MessageSquare, Users, Search } from 'lucide-react';
import type { Conversation } from '../types';
import type { Contact, Group } from '../hooks/useChatContacts';
import ConversationItem from './ConversationItem';

interface ChatSidebarProps {
  conversations: Conversation[];
  contacts: Contact[];
  groups: Group[];
  loading: boolean;
  onSelect: (conv: Conversation) => void;
  onStartNewChat: (target: Contact | Group, isGroup: boolean) => void;
  selectedId?: string;
  currentUserId: string;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onDeleteConversation: (id: string) => Promise<void>;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  conversations, 
  contacts, 
  groups, 
  loading, 
  onSelect, 
  onStartNewChat,
  selectedId,
  currentUserId,
  searchTerm,
  onSearchChange,
  onDeleteConversation
}) => {
  const [view, setView] = useState<'conversations' | 'contacts'>('conversations');

  const handleDeleteConversation = useCallback(async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    try {
      await onDeleteConversation(conversationId);
    } catch (error: any) {
      console.error("Failed to delete conversation", error);
    }
  }, [onDeleteConversation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Helper to check if contact is selected
  const isContactSelected = (contactId: string) => {
    if (!selectedId) return false;
    if (selectedId === `temp-${contactId}`) return true;
    
    const activeConv = conversations.find(c => c._id === selectedId);
    if (activeConv && activeConv.type === 'DM') {
      return activeConv.participants.some(p => p.userId._id === contactId);
    }
    return false;
  };

  const isGroupSelected = (groupId: string) => {
    if (!selectedId) return false;
    if (selectedId === `temp-${groupId}`) return true;
    
    const activeConv = conversations.find(c => c._id === selectedId);
    if (activeConv && activeConv.type === 'GROUP') {
      return activeConv.groupId?._id === groupId;
    }
    return false;
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white shadow-md">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          المحادثات
        </h2>

        {/* Search Input */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="بحث عن محادثة أو شخص..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full py-2.5 pr-10 pl-4 rounded-lg bg-white/20 text-white placeholder-white/80 border border-white/30 focus:outline-none focus:bg-white/30 focus:border-white transition-all backdrop-blur-sm"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/80" />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setView('conversations')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
              view === 'conversations'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            المحادثات
          </button>
          <button
            onClick={() => setView('contacts')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
              view === 'contacts'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm'
            }`}
          >
            <Users className="w-4 h-4" />
            جهات الاتصال
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto scroll-smooth chat-scroll overscroll-contain">
        {view === 'conversations' ? (
          // Show existing conversations
          conversations.length === 0 ? (
            <EmptyState
              icon={<MessageSquare className="w-20 h-20 text-gray-300" />}
              title="لا توجد محادثات"
              description="ابدأ محادثة جديدة من جهات الاتصال"
            />
          ) : (
            Array.from(new Map(conversations.map(conv => [conv._id, conv])).values())
              .filter(conv => conv && conv._id) // Filter out invalid conversations
              .map(conv => (
                <ConversationItem
                  key={conv._id}
                  conversation={conv}
                  isSelected={selectedId === conv._id}
                  currentUserId={currentUserId}
                  onSelect={onSelect}
                  onDelete={handleDeleteConversation}
                />
              ))
          )
        ) : (
          // Show contacts & groups to start new chat
          <div className="p-2">
            {/* Groups Section */}
            {groups.length > 0 && (
              <div className="mb-5">
                <div className="px-4 py-2.5 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-lg mb-2 flex items-center gap-2 border-r-4 border-emerald-500">
                  <Users className="w-4 h-4" />
                  الحلقات
                </div>
                <div className="space-y-1">
                  {groups.filter(g => g && g._id).map(group => {
                    const isSelected = isGroupSelected(group._id);
                    return (
                    <div
                      key={group._id}
                      onClick={() => onStartNewChat(group, true)}
                      className={`flex items-center p-3 mx-1 rounded-lg cursor-pointer transition-all duration-200 group ${
                        isSelected 
                          ? 'bg-emerald-50 border-r-4 border-emerald-500 shadow-sm' 
                          : 'hover:bg-gray-50 border-r-4 border-transparent'
                      }`}
                    >
                      <div className="ml-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-105 transition-transform">
                          {group.name.charAt(0)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{group.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          محادثة جماعية
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Contacts Section */}
            {contacts.length > 0 && (
              <div>
                <div className="px-4 py-2.5 bg-teal-50 text-teal-700 text-sm font-bold rounded-lg mb-2 flex items-center gap-2 border-r-4 border-teal-500">
                  <MessageSquare className="w-4 h-4" />
                  جهات الاتصال
                </div>
                <div className="space-y-1">
                  {contacts.filter(c => c && c._id).map(contact => {
                    const isSelected = isContactSelected(contact._id);
                    return (
                    <div
                      key={contact._id}
                      onClick={() => onStartNewChat(contact, false)}
                      className={`flex items-center p-3 mx-1 rounded-lg cursor-pointer transition-all duration-200 group ${
                        isSelected 
                          ? 'bg-teal-50 border-r-4 border-teal-500 shadow-sm' 
                          : 'hover:bg-gray-50 border-r-4 border-transparent'
                      }`}
                    >
                      <div className="ml-3">
                        <Avatar 
                          userId={contact._id}
                          src={contact.avatar?.url}
                          userName={contact.firstName}
                          size="md"
                          showStatus={true}
                          statusSize="sm"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{contact.firstName} {contact.lastName}</div>
                        <Badge 
                          variant={contact.role === 'student' ? 'success' : contact.role === 'teacher' ? 'primary' : 'warning'}
                          className="text-xs"
                        >
                          {contact.role === 'student' ? 'طالب' : contact.role === 'teacher' ? 'معلم' : 'مدير'}
                        </Badge>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}

            {contacts.length === 0 && groups.length === 0 && (
              <EmptyState
                icon={<Users className="w-20 h-20 text-gray-300" />}
                title="لا توجد جهات اتصال"
                description="لم يتم العثور على أي جهات اتصال أو مجموعات"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
