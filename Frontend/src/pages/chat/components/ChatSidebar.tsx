import React from 'react';
import { Avatar } from '../../../components/Avatar';
import { LoadingSpinner } from '../../../components/UI';
import { MessageSquare, Users, Search } from 'lucide-react';
import type { Conversation } from '../types';
import type { Contact, Group } from '../hooks/useChatContacts';
import ConversationItem from './ConversationItem';
import { useChatSidebar } from '../hooks/useChatSidebar';

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
  const {
    view,
    setView,
    handleDeleteConversation,
    isContactSelected,
    isGroupSelected,
  } = useChatSidebar(conversations, selectedId, onDeleteConversation);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
          </div>
          المحادثات
        </h2>

        {/* Search Input */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="بحث..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full py-3 pr-11 pl-4 rounded-xl bg-gray-50 text-gray-700 placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setView('conversations')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
              view === 'conversations'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            المحادثات
          </button>
          <button
            onClick={() => setView('contacts')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
              view === 'contacts'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4" />
            جهات الاتصال
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto scroll-smooth chat-scroll overscroll-contain p-2">
        {view === 'conversations' ? (
          // Show existing conversations
          conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-gray-900 font-medium mb-1">لا توجد محادثات</h3>
              <p className="text-gray-500 text-sm">ابدأ محادثة جديدة من جهات الاتصال</p>
            </div>
          ) : (
            <div className="space-y-1">
              {Array.from(new Map(conversations.map(conv => [conv._id, conv])).values())
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
                ))}
            </div>
          )
        ) : (
          // Show contacts & groups to start new chat
          <div className="space-y-6 pt-2">
            {/* Groups Section */}
            {groups.length > 0 && (
              <div>
                <div className="px-3 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  الحلقات والمجموعات
                </div>
                <div className="space-y-1">
                  {groups.filter(g => g && g._id).map(group => {
                    const isSelected = isGroupSelected(group._id);
                    return (
                    <div
                      key={group._id}
                      onClick={() => onStartNewChat(group, true)}
                      className={`flex items-center p-3 mx-1 rounded-xl cursor-pointer transition-all duration-200 group ${
                        isSelected 
                          ? 'bg-emerald-50 shadow-sm ring-1 ring-emerald-500/20' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="ml-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-105 transition-transform">
                          {group.name.charAt(0)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-800 truncate">{group.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Users className="w-3 h-3" />
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
                <div className="px-3 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  جهات الاتصال
                </div>
                <div className="space-y-1">
                  {contacts.filter(c => c && c._id).map(contact => {
                    const isSelected = isContactSelected(contact._id);
                    return (
                    <div
                      key={contact._id}
                      onClick={() => onStartNewChat(contact, false)}
                      className={`flex items-center p-3 mx-1 rounded-xl cursor-pointer transition-all duration-200 group ${
                        isSelected 
                          ? 'bg-emerald-50 shadow-sm ring-1 ring-emerald-500/20' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="ml-2">
                        <Avatar 
                          userId={contact._id}
                          src={contact.avatar?.url}
                          userName={contact.firstName}
                          size="md"
                          showStatus={true}
                          statusSize="sm"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-800 truncate">{contact.firstName} {contact.lastName}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            contact.role === 'student' ? 'bg-blue-50 text-blue-600' : 
                            contact.role === 'teacher' ? 'bg-purple-50 text-purple-600' : 
                            'bg-orange-50 text-orange-600'
                          }`}>
                            {contact.role === 'student' ? 'طالب' : contact.role === 'teacher' ? 'معلم' : contact.role === 'secretary' ? 'سكرتير' : contact.role === 'teacherAssistant' ? 'مساعد مدرس' : 'مدير'}
                          </span>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}

            {contacts.length === 0 && groups.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                <Users className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">لم يتم العثور على أي جهات اتصال</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
