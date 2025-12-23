import React, { useState } from 'react';
import { Avatar } from '../../../components/Avatar';
import { EmptyState, LoadingSpinner, Badge } from '../../../components/UI';
import { MessageSquare, Users, Search, Trash2 } from 'lucide-react';
import type { Conversation } from '../types';
import type { Contact, Group } from '../hooks/useChatContacts';
import api from '../../../Api/api';
import { showConfirmMessage, showSuccessMessage, showErrorMessage } from '../../../utils/sweetalertUtils';

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

  const handleDeleteConversation = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    
    try {
      const confirmed = await showConfirmMessage(
        "حذف المحادثة؟",
        "سيتم حذف المحادثة وجميع الرسائل نهائياً من قاعدة البيانات. هل أنت متأكد؟",
        "نعم، احذف",
        "إلغاء"
      );

      if (confirmed.isConfirmed) {
        await onDeleteConversation(conversationId);
        showSuccessMessage("تم الحذف", "تم حذف المحادثة بنجاح");
      }
    } catch (error: any) {
      showErrorMessage("خطأ", error.response?.data?.message || "فشل حذف المحادثة");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const getConversationDisplay = (conv: Conversation) => {
    if (conv.type === 'GROUP' && conv.groupId) {
      return {
        name: conv.groupId.name,
        subtitle: 'محادثة جماعية',
        avatar: conv.groupId.image?.url || null,
        userId: conv.groupId._id
      };
    } else {
      // DM: Get the other participant
      const otherParticipant = conv.participants.find(p => p.userId._id !== currentUserId);
      if (otherParticipant) {
        return {
          name: `${otherParticipant.userId.firstName} ${otherParticipant.userId.lastName}`,
          subtitle: otherParticipant.userModel === 'Student' ? 'طالب' : otherParticipant.userModel === 'Teacher' ? 'معلم' : 'مدير',
          avatar: otherParticipant.userId.avatar?.url,
          userId: otherParticipant.userId._id
        };
      }
    }
    return { name: 'محادثة', subtitle: '', avatar: null, userId: '' };
  };

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
      
      <div className="flex-1 overflow-y-auto scroll-smooth chat-scroll">
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
              .map(conv => {
              const display = getConversationDisplay(conv);
              return (
                <div 
                  key={conv._id}
                  onClick={() => onSelect(conv)}
                  className={`flex items-center p-3.5 mx-2 my-1 rounded-lg cursor-pointer transition-all duration-200 relative group ${
                    selectedId === conv._id
                      ? 'bg-emerald-50 shadow-sm border-r-4 border-emerald-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="ml-3">
                    <Avatar 
                      userId={display.userId}
                      src={display.avatar || undefined}
                      userName={display.name}
                      size="md"
                      showStatus={conv.type === 'DM'}
                      statusSize="sm"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{display.name}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {conv.lastMessage?.text || display.subtitle}
                    </div>
                  </div>

                  {/* Delete Button - Shows on Hover */}
                  <button
                    onClick={(e) => handleDeleteConversation(e, conv._id)}
                    className="absolute left-2 opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 z-10"
                    title="حذف المحادثة"
                  >
                    <Trash2 size={16} />
                  </button>

                  {conv.unreadCount > 0 && (
                    <Badge 
                      variant="danger"
                      className="absolute top-2 left-2 min-w-[20px] h-5 flex items-center justify-center animate-pulse"
                    >
                      {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                    </Badge>
                  )}
                </div>
              );
            })
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
