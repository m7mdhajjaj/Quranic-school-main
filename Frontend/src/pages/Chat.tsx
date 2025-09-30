import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FiPaperclip, FiMic } from 'react-icons/fi';
import { io, Socket } from 'socket.io-client';
import Avatar from '../components/Avatar';
import { getUserGender, useAvatar } from '../hooks/useAvatar';
import { useAuth } from '../hooks/useAuth';

// دالة تنسيق آخر ظهور بصيغة "منذ..." 
const formatLastSeen = (lastSeen: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - lastSeen.getTime();
  
  // تحويل إلى وحدات مختلفة
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  
  // إذا كان أقل من دقيقة
  if (diffSeconds < 60) {
    return "منذ لحظات";
  }
  
  // إذا كان أقل من ساعة
  if (diffMinutes < 60) {
    return diffMinutes === 1 ? "منذ دقيقة" : `منذ ${diffMinutes} دقيقة`;
  }
  
  // إذا كان أقل من يوم (24 ساعة)
  if (diffHours < 24) {
    return diffHours === 1 ? "منذ ساعة" : `منذ ${diffHours} ساعة`;
  }
  
  // إذا كان أقل من أسبوع
  if (diffDays < 7) {
    return diffDays === 1 ? "منذ يوم" : `منذ ${diffDays} أيام`;
  }
  
  // إذا كان أقل من شهر
  if (diffWeeks < 4) {
    return diffWeeks === 1 ? "منذ أسبوع" : `منذ ${diffWeeks} أسابيع`;
  }
  
  // إذا كان أقل من سنة
  if (diffMonths < 12) {
    return diffMonths === 1 ? "منذ شهر" : `منذ ${diffMonths} أشهر`;
  }
  
  // إذا كان أكثر من سنة
  const diffYears = Math.floor(diffMonths / 12);
  return diffYears === 1 ? "منذ سنة" : `منذ ${diffYears} سنوات`;
};


type AttachmentType = 'image' | 'file' | 'audio';

interface Attachment {
  url: string;
  name?: string;
  type: AttachmentType;
  size?: number;
  durationSec?: number;
}

interface ChatMessage {
  _id: string;
  sender: string | { _id: string; firstName: string; lastName?: string }; // userId or populated user
  text?: string;
  createdAt: string;
  read?: boolean;
  delivered?: boolean; // وصلت للمستلم
  deliveredAt?: string; // وقت الوصول
  readAt?: string; // وقت القراءة
  recipientOnline?: boolean; // حالة اتصال المستلم
  editedAt?: string;
  reactions?: Record<string, string[]>; // emoji -> [userIds]
  attachments?: Attachment[];
  replyTo?:
    | {
        // الرسالة المردود عليها (populated)
        _id: string;
        text: string;
        sender: { _id: string; firstName: string; lastName?: string };
        createdAt: string;
      }
    | string; // or just ID if not populated
  // client-only helpers
  __pending?: boolean;
  __error?: boolean;
}

interface Contact {
  _id: string;
  firstName: string;
  lastName?: string;
  group?: string;
  unread?: number;
  isGroup?: boolean; // for group list
  isActive?: boolean; // <-- active flag from database
}




const API_URL = 'http://localhost:5005/api';
const SOCKET_URL = 'http://localhost:5005';

// مكون مساعد لعرض الأفاتار مع الصورة والحالة
const ChatAvatar: React.FC<{
  user: Contact | { _id: string; firstName: string; lastName?: string } | null;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  className?: string;
  isActive?: boolean;
}> = ({ user, size = 'md', showStatus = false, className = '', isActive }) => {
  const userGender = getUserGender(user);
  const { avatarUrl, avatarLoading } = useAvatar({
    userId: user?._id,
    userRole: 'student', // default role for contacts
  });

  const onlineStatus = showStatus && isActive !== undefined 
    ? (isActive ? 'online' : 'offline') 
    : undefined;

  return (
    <Avatar
      src={avatarUrl}
      userName={user?.firstName}
      gender={userGender}
      size={size}
      className={className}
      showStatus={showStatus}
      forceStatus={onlineStatus}
      loading={avatarLoading}
    />
  );
};

// ...existing code...

const Chat: React.FC = () => {
  const { user: currentUser, token } = useAuth();

  // Left pane
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);

  // Conversation
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Compose
  const [messageInput, setMessageInput] = useState('');
  // ...existing code...
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  // Reply functionality
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);

  // Reply functions
  const handleReply = (message: ChatMessage) => {
    setReplyTo(message);
    // Focus on input
    const inputElement = document.querySelector(
      'input[placeholder*="اكتب رسالتك"]'
    ) as HTMLInputElement;
    if (inputElement) inputElement.focus();
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  // Presence
  const [isTyping, setIsTyping] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  
  // User Status & Last Seen
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [lastSeenData, setLastSeenData] = useState<Map<string, Date>>(new Map());
  
  // Message Status Tracking
  const [messageStatusMap, setMessageStatusMap] = useState<Map<string, {
    delivered: boolean;
    read: boolean;
    deliveredAt?: string;
    readAt?: string;
    recipientOnline?: boolean;
  }>>(new Map());

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // ----- Helpers -----
  const getModelName = (role?: string) => {
    if (!role) return 'Student';
    return role.toLowerCase().includes('teacher') ||
      role.toLowerCase().includes('admin')
      ? 'Teacher'
      : 'Student';
  };

  const getEntityId = (obj: string | { _id?: string; id?: string; teacherId?: string; studentId?: string; userId?: string; toString?: () => string } | null | undefined) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    if (typeof obj === 'object') {
      if (obj._id) return String(obj._id);
      if (obj.id) return String(obj.id);
      if (obj.teacherId) return String(obj.teacherId);
      if (obj.studentId) return String(obj.studentId);
      if (obj.userId) return String(obj.userId);
      if (typeof obj.toString === 'function') return obj.toString();
    }
    return '';
  };

  const getAuthHeaders = (): Record<string, string> => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };



  const currentUserId = getEntityId(currentUser);
  const selectedId = getEntityId(selectedContact);
  const isGroupChat = !!selectedContact?.isGroup;

  // ----- Load notification deep-link -----
  useEffect(() => {
    // تنظيف الإشعارات القديمة من localStorage فقط
    const chatNotifRaw = localStorage.getItem('chatNotification');
    if (chatNotifRaw) {
      localStorage.removeItem('chatNotification');
    }
  }, []);

  // ----- Load contacts & groups -----
  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      setLoading(true);
      try {
        const role = (currentUser.role || '').toLowerCase();
        if (role === 'teacher' || role === 'admin') {
          // Students list for teacher
          const resp = await fetch(`${API_URL}/students`, {
            headers: { ...getAuthHeaders() },
          });
          const data = resp.ok ? await resp.json() : [];
          const list: Contact[] = Array.isArray(data)
            ? data.map((s: any) => ({
                _id: s._id || s.id,
                firstName: s.firstName || s.name || '',
                lastName: s.lastName || '',
                group: s.group || s.section || '',
                unread: s.unread || 0,
                isActive: s.isActive, // <-- set isActive from response
              }))
            : [];
          setContacts(list);
        } else {
          // Teachers for this student (you had a custom route before; here we fallback gracefully)
          const studentId = getEntityId(currentUser);
          const trySpecific = await fetch(
            `${API_URL}/teachers/for-student/${studentId}`,
            { headers: { ...getAuthHeaders() } }
          );
          let list: Contact[] = [];
          if (trySpecific.ok) {
            const response = await trySpecific.json();
            const data = response.success ? response.data : response;
            list = (Array.isArray(data) ? data : []).map((t: any) => ({
              _id: t._id || t.id,
              firstName: t.firstName || t.name || 'Teacher',
              lastName: t.lastName || '',
              group: Array.isArray(t.groups) ? t.groups.join(', ') : '',
              unread: t.unread || 0,
              isActive: t.isActive, // <-- set isActive from response
            }));
          }
          if (list.length === 0) {
            const allTeachers = await fetch(`${API_URL}/teachers`, {
              headers: { ...getAuthHeaders() },
            });
            if (allTeachers.ok) {
              const response = await allTeachers.json();
              const data = response.success ? response.data : response;
              list = (Array.isArray(data) ? data : []).map((t: any) => ({
                _id: t._id || t.id,
                firstName: t.firstName || t.name || 'Teacher',
                lastName: t.lastName || '',
                group: Array.isArray(t.groups) ? t.groups.join(', ') : '',
                unread: t.unread || 0,
                isActive: t.isActive, // <-- set isActive from response
              }));
            }
          }
          setContacts(list);
          if (!selectedContact && list.length) setSelectedContact(list[0]);
        }

   
      } finally {
        setLoading(false);
      }
    })();
  }, [currentUser]);

  // ----- Load Last Seen Data -----
  useEffect(() => {
    const loadLastSeenData = async () => {
      if (!currentUser) return;
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(getAuthHeaders() as any),
        };
        const response = await fetch(`${API_URL}/users/last-seen`, { headers });
        
        if (response.ok) {
          const data = await response.json();
          console.log('🔍 البيانات المستلمة من API:', data);
          const lastSeenMap = new Map<string, Date>();
          const activeUsersSet = new Set<string>();
          
          data.forEach((user: any) => {
            console.log(`👤 معالجة المستخدم ${user._id}:`, {
              isActive: user.isActive,
              lastSeen: user.lastSeen,
              lastSeenType: typeof user.lastSeen
            });
            
            // حفظ حالة النشاط للمستخدمين المتصلين
            if (user.isActive === true) {
              activeUsersSet.add(user._id);
            }
            
            // حفظ lastSeen لجميع المستخدمين (حتى المتصلين منهم)
            if (user.lastSeen && user.lastSeen !== null) {
              try {
                const lastSeenDate = new Date(user.lastSeen);
                // التأكد من أن التاريخ صحيح
                if (!isNaN(lastSeenDate.getTime())) {
                  lastSeenMap.set(user._id, lastSeenDate);
                }
              } catch (error) {
                console.warn(`خطأ في تحويل lastSeen للمستخدم ${user._id}:`, error);
              }
            }
          });
          
          console.log('📊 خريطة آخر ظهور النهائية:', [...lastSeenMap.entries()]);
          console.log('👥 المستخدمون النشطون:', [...activeUsersSet]);
          
          setLastSeenData(lastSeenMap);
          setOnlineUsers(activeUsersSet);
        } else {
          console.error('🚨 فشل في تحميل بيانات آخر ظهور:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('📄 تفاصيل الخطأ:', errorText);
        }
      } catch (error) {
        console.error('🚨 خطأ في طلب بيانات آخر ظهور:', error);
      }
    };

    loadLastSeenData();
    
    // تحديث البيانات كل 30 ثانية
    const interval = setInterval(loadLastSeenData, 30000);
    return () => clearInterval(interval);
  }, [currentUser, getAuthHeaders]);

  // ----- Load conversation -----
  const loadConversation = async () => {
    if (!currentUser || !selectedContact) return;
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(getAuthHeaders() as any),
      };
      if (isGroupChat) {
        // Group history
        const resp = await fetch(
          `${API_URL}/chat/group/${encodeURIComponent(selectedContact._id)}`,
          { headers }
        );
        const data = resp.ok ? await resp.json() : [];
        const list: ChatMessage[] = Array.isArray(data)
          ? data.map((m: any) => ({
              _id: m._id,
              sender: getEntityId(m.sender) || m.sender,
              text: m.text,
              createdAt: m.createdAt,
              read: m.read,
              replyTo: m.replyTo || undefined, // إضافة معلومات الرد
              // attachments(optional): server support later
            }))
          : [];
        setMessages(list);
      } else {
        const senderId = getEntityId(currentUser);
        const senderType = getModelName(currentUser.role);
        const recipientId = getEntityId(selectedContact);
        const recipientType = senderType === 'Teacher' ? 'Student' : 'Teacher';
        const url = `${API_URL}/chat/conversation/${senderId}/${senderType}/${recipientId}/${recipientType}`;
        const resp = await fetch(url, { headers });
        const data = resp.ok ? await resp.json() : [];
        const list: ChatMessage[] = Array.isArray(data)
          ? data.map((m: any) => ({
              _id: m._id,
              sender: getEntityId(m.sender) || m.sender,
              text: m.text,
              createdAt: m.createdAt,
              read: m.read,
              replyTo: m.replyTo || undefined, // إضافة معلومات الرد
            }))
          : [];
        setMessages(list);
      }
      scrollToBottomSmooth();
      // mark visible messages as read (only those not sent by me)
      markVisibleAsRead();
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    loadConversation();
    
    // إشعار فتح المحادثة عند تحديد محادثة جديدة
    if (selectedContact && socketRef.current?.connected) {
      socketRef.current.emit('chatOpened', {
        userId: currentUserId,
        chatWith: selectedContact._id
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContact, currentUser]);

  // ----- Socket -----
  useEffect(() => {
    if (!currentUser) return;
    const s = io(SOCKET_URL, {
      transports: ['polling'],
      upgrade: false,
      path: '/socket.io',
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
    socketRef.current = s;

    s.on('connect', () => {
      s.emit('login', {
        userId: currentUserId,
        role: currentUser?.role || 'student',
      });
    });

    // Presence
    s.on('presence:update', (payload: { userId: string; online: boolean }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (payload.online) {
          newSet.add(payload.userId);
        } else {
          newSet.delete(payload.userId);
          // عند تسجيل الخروج، قم بتحديث آخر ظهور للمستخدم
          setLastSeenData(prevLastSeen => {
            const newLastSeen = new Map(prevLastSeen);
            newLastSeen.set(payload.userId, new Date());
            return newLastSeen;
          });
        }
        return newSet;
      });
    });
    
    // استقبال تحديثات حالة المستخدمين (للتحديث التلقائي)
    s.on('userStatusChange', (data: { 
      userId: string; 
      isActive: boolean; 
      lastSeen?: string;
    }) => {
      console.log('🔄 تحديث حالة المستخدم عبر Socket:', data);
      
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (data.isActive) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
      
      // تحديث قائمة جهات الاتصال مباشرة
      setContacts(prevContacts => 
        prevContacts.map(contact => 
          contact._id === data.userId 
            ? { ...contact, isActive: data.isActive }
            : contact
        )
      );
      
      // تحديث آخر ظهور إذا توفر
      if (data.lastSeen) {
        setLastSeenData(prevLastSeen => {
          const newLastSeen = new Map(prevLastSeen);
          newLastSeen.set(data.userId, new Date(data.lastSeen!));
          return newLastSeen;
        });
      }
    });

    s.on('typing', (payload: { from: string; to?: string; group?: string }) => {
      if (!selectedContact) return;
      if (isGroupChat) {
        if (payload.group === selectedContact._id) setPeerTyping(true);
      } else {
        if (payload.from === selectedId) setPeerTyping(true);
      }
      window.setTimeout(() => setPeerTyping(false), 1500);
    });

    // Receive new message
    s.on('receiveMessage', (msg: any) => {
      console.log('Received message from socket:', msg);
      console.log('replyTo data:', msg.replyTo);

      const incoming: ChatMessage = {
        _id: msg._id || Date.now().toString(),
        sender: getEntityId(msg.sender) || msg.senderId || msg.sender || '',
        text: msg.text || '',
        createdAt: msg.createdAt || new Date().toISOString(),
        read: msg.read ?? false,
        delivered: true, // الرسالة وصلت فعلاً
        deliveredAt: new Date().toISOString(),
        attachments: msg.attachments || undefined,
        replyTo: msg.replyTo || undefined,
      };
      
      const belongsToThisChat = isGroupChat
        ? msg.isGroupMessage && msg.group === selectedContact?._id
        : !msg.isGroupMessage &&
          (incoming.sender === selectedId || incoming.sender === currentUserId);
          
      if (selectedContact && belongsToThisChat) {
        setMessages((prev) => [...prev, incoming]);
        
        // إرسال إشعار فوري بالتوصيل للمرسل
        if (incoming.sender !== currentUserId) {
          s.emit('messageDeliveredConfirm', {
            messageId: incoming._id,
            recipientId: currentUserId,
            deliveredAt: new Date().toISOString()
          });
        }
        
        // mark as read soon after render
        window.setTimeout(() => {
          markVisibleAsRead();
          // إرسال إشعار القراءة
          if (incoming.sender !== currentUserId) {
            s.emit('messageReadConfirm', {
              messageId: incoming._id,
              recipientId: currentUserId,
              readAt: new Date().toISOString()
            });
          }
        }, 300);
      } else {
        // bump unread for corresponding contact
        setContacts((prev) =>
          prev.map((c) =>
            c._id === incoming.sender
              ? { ...c, unread: (c.unread || 0) + 1 }
              : c
          )
        );
      }
      scrollToBottomSmooth();
    });

    // Server ack for sent message
    s.on('messageSent', (saved: any) => {
      if (!saved) return;
      console.log('Message sent confirmation:', saved);
      console.log('messageSent replyTo:', saved.replyTo);

      const normalized: ChatMessage = {
        _id: saved._id || Date.now().toString(),
        sender:
          getEntityId(saved.sender) ||
          currentUserId ||
          saved.senderId ||
          saved.sender ||
          '',
        text: saved.text || '',
        createdAt: saved.createdAt || new Date().toISOString(),
        read: saved.read ?? false,
        delivered: saved.delivered ?? false,
        deliveredAt: saved.deliveredAt,
        recipientOnline: saved.recipientOnline ?? false,
        attachments: saved.attachments || undefined,
        replyTo: saved.replyTo || undefined, // إضافة معلومات الرد
        __pending: false,
      };
      setMessages((prev) => {
        const idx = prev.findIndex(
          (m) =>
            String(m._id).startsWith('tmp-') &&
            (m.text || '') === (normalized.text || '')
        );
        if (idx !== -1) {
          const copy = [...prev];
          copy[idx] = normalized;
          return copy;
        }
        return [...prev, normalized];
      });
      scrollToBottomSmooth();
    });

    // Reactions
    s.on(
      'reactionUpdated',
      ({
        messageId,
        emoji,
        users,
      }: {
        messageId: string;
        emoji: string;
        users: string[];
      }) => {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId
              ? { ...m, reactions: { ...(m.reactions || {}), [emoji]: users } }
              : m
          )
        );
      }
    );

    // Edits/Deletes
    s.on('messageEdited', (m: any) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === m._id
            ? { ...msg, text: m.text, editedAt: m.editedAt }
            : msg
        )
      );
    });
    s.on('messageDeleted', ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    });

    // حدث توصيل الرسالة المحدث
    s.on('messageDelivered', (data: {
      messageId: string;
      recipientOnline: boolean;
      deliveredAt?: string;
    }) => {
      console.log('📬 تأكيد توصيل الرسالة:', data);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === data.messageId
            ? {
                ...m,
                delivered: true,
                deliveredAt: data.deliveredAt || new Date().toISOString(),
                recipientOnline: data.recipientOnline,
              }
            : m
        )
      );
      
      // تحديث خريطة حالة الرسائل
      setMessageStatusMap(prev => {
        const newMap = new Map(prev);
        newMap.set(data.messageId, {
          ...newMap.get(data.messageId),
          delivered: true,
          deliveredAt: data.deliveredAt || new Date().toISOString(),
          recipientOnline: data.recipientOnline
        });
        return newMap;
      });
    });

    // حدث قراءة الرسالة المحدث
    s.on('messageRead', (data: {
      messageId: string;
      readAt?: string;
    }) => {
      console.log('👁️ تأكيد قراءة الرسالة:', data);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === data.messageId
            ? {
                ...m,
                read: true,
                readAt: data.readAt || new Date().toISOString(),
              }
            : m
        )
      );
      
      // تحديث خريطة حالة الرسائل
      setMessageStatusMap(prev => {
        const newMap = new Map(prev);
        newMap.set(data.messageId, {
          ...newMap.get(data.messageId),
          read: true,
          readAt: data.readAt || new Date().toISOString()
        });
        return newMap;
      });
    });
    
    // مستمع جديد لتحديثات فورية عند فتح الدردشة
    s.on('chatOpened', (data: {
      userId: string;
      chatWith: string;
    }) => {
      // إذا فتح شخص الدردشة معي، قم بتحديث حالة رسائلي إليه
      if (data.chatWith === currentUserId) {
        setMessages(prev => 
          prev.map(msg => 
            msg.sender === currentUserId && !msg.delivered
              ? { ...msg, delivered: true, deliveredAt: new Date().toISOString() }
              : msg
          )
        );
      }
    });

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, selectedContact]);

  // ----- Scrolling & read receipts -----
  const scrollToBottomSmooth = () => {
    window.setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }),
      50
    );
  };

  const markVisibleAsRead = async () => {
    // collect messages not mine & not read
    const toMark = messages
      .filter((m) => m.sender !== currentUserId && !m.read)
      .map((m) => m._id);
    if (toMark.length === 0) return;
    try {
      await fetch(`${API_URL}/chat/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(getAuthHeaders() as any),
        },
        body: JSON.stringify({ messageIds: toMark }),
      });
      setMessages((prev) =>
        prev.map((m) => (toMark.includes(m._id) ? { ...m, read: true } : m))
      );
    } catch {}
  };

  // Mark on scroll end
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      // when near bottom, assume messages visible
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 60)
        markVisibleAsRead();
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, selectedContact]);

  // ----- Send typing events -----
  useEffect(() => {
    if (!selectedContact || !socketRef.current) return;
    if (!messageInput.trim()) return;
    if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
    setIsTyping(true);
    const payload = isGroupChat
      ? { group: selectedContact._id, from: currentUserId }
      : { to: selectedId, from: currentUserId };
    socketRef.current.emit('typing', payload);
    typingTimeoutRef.current = window.setTimeout(
      () => setIsTyping(false),
      1000
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageInput]);

  // ...existing code...

  const onFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const newAtts: Attachment[] = [];
      for (const f of Array.from(files)) {
        const form = new FormData();
        form.append('file', f);
        let url: string | null = null;
        try {
          const resp = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: { ...(getAuthHeaders() as any) },
            body: form,
          });
          if (resp.ok) {
            const data = await resp.json();
            url = data.url;
          }
        } catch {}
        if (!url) continue; // Only use backend URLs
        const type: AttachmentType = f.type.startsWith('image/')
          ? 'image'
          : f.type.startsWith('audio/')
            ? 'audio'
            : 'file';
        newAtts.push({ url, name: f.name, size: f.size, type });
      }
      setAttachments((prev) => [...prev, ...newAtts]);
    } finally {
      setUploading(false);
    }
  };

  const startRecording = async () => {
    if (isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      audioChunksRef.current = [];
      rec.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      rec.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Upload voice to backend
        const form = new FormData();
        form.append('file', blob, `voice-${Date.now()}.webm`);
        let url: string | null = null;
        try {
          const resp = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: { ...(getAuthHeaders() as any) },
            body: form,
          });
          if (resp.ok) {
            const data = await resp.json();
            url = data.url;
          }
        } catch {}
        if (!url) return;
        setAttachments((prev) => [
          ...prev,
          {
            url,
            name: `voice-${Date.now()}.webm`,
            type: 'audio',
            size: blob.size,
          },
        ]);
      };
      rec.start();
      mediaRecorderRef.current = rec;
      setIsRecording(true);
    } catch {
      // mic denied
    }
  };
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    setIsRecording(false);
  };

  // ----- Send message -----
  const [sendSuccess, setSendSuccess] = useState(false);

  const sendMessage = async () => {
    if ((!messageInput.trim() && attachments.length === 0) || !selectedContact)
      return;

    const payload: any = {
      sender: currentUserId || 'local',
      senderModel: getModelName(currentUser?.role),
      text: messageInput.trim() || undefined,
      attachments: attachments.length ? attachments : undefined, // server: add to schema if desired
      replyTo: replyTo?._id || undefined, // إضافة الرد
    };

    if (isGroupChat) {
      payload.isGroupMessage = true;
      payload.group = selectedContact._id; // server expects group name/id
    } else {
      payload.recipient = selectedId;
      payload.recipientModel =
        getModelName(currentUser?.role) === 'Teacher' ? 'Student' : 'Teacher';
      payload.isGroupMessage = false;
    }

    // optimistic insert
    const temp: ChatMessage = {
      _id: `tmp-${Date.now()}`,
      sender: payload.sender,
      text: payload.text,
      createdAt: new Date().toISOString(),
      read: false,
      attachments: attachments.length ? attachments : undefined,
      replyTo: replyTo?._id || undefined, // إضافة معرف الرد فقط
      __pending: true,
    };
    setMessages((prev) => [...prev, temp]);
    setMessageInput('');
    setAttachments([]);
    setReplyTo(null); // إلغاء الرد بعد الإرسال
    scrollToBottomSmooth();

    // Send via socket if connected
    if (socketRef.current?.connected) {
      socketRef.current.emit('sendMessage', payload);
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 1200);
    } else {
      // REST fallback
      try {
        const headers: Record<string, string> = {
          ...(getAuthHeaders() as any),
        };
        const resp = await fetch(`${API_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify(payload),
        });
        if (resp.ok) {
          const saved = await resp.json();
          setMessages((prev) => {
            const idx = prev.findIndex((m) => m._id === temp._id);
            const copy = [...prev];
            const normalized: ChatMessage = {
              _id: saved._id,
              sender: getEntityId(saved.sender) || currentUserId,
              text: saved.text,
              createdAt: saved.createdAt,
              read: saved.read ?? false,
              attachments: saved.attachments || temp.attachments,
              replyTo: saved.replyTo || undefined, // إضافة الرح
            };
            if (idx !== -1) copy[idx] = normalized;
            else copy.push(normalized);
            return copy;
          });
          setSendSuccess(true);
          setTimeout(() => setSendSuccess(false), 1200);
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === temp._id ? { ...m, __pending: false, __error: true } : m
            )
          );
        }
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === temp._id ? { ...m, __pending: false, __error: true } : m
          )
        );
      }
    }
  };

  // ----- Message actions: react, edit, delete, pin -----
  const toggleReaction = (messageId: string, emoji: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('reactMessage', {
      messageId,
      emoji,
      userId: currentUserId,
    }); // TODO server
  };

  const editMessage = async (m: ChatMessage) => {
    const newText = window.prompt('تعديل الرسالة:', m.text || '');
    if (newText == null) return;
    // Optimistic UI
    setMessages((prev) =>
      prev.map((x) =>
        x._id === m._id
          ? { ...x, text: newText, editedAt: new Date().toISOString() }
          : x
      )
    );
    // Socket &/or REST
    socketRef.current?.emit('editMessage', { messageId: m._id, text: newText }); // TODO server
    try {
      await fetch(`${API_URL}/chat/${m._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(getAuthHeaders() as any),
        },
        body: JSON.stringify({ text: newText }),
      }); // TODO server route
    } catch {}
  };

  const deleteMessage = async (m: ChatMessage) => {
    if (!window.confirm('هل تريد حذف الرسالة؟')) return;
    setMessages((prev) => prev.filter((x) => x._id !== m._id));
    socketRef.current?.emit('deleteMessage', { messageId: m._id }); // TODO server
    try {
      await fetch(`${API_URL}/chat/${m._id}`, {
        method: 'DELETE',
        headers: { ...(getAuthHeaders() as any) },
      }); // TODO server route
    } catch {}
  };

  // Show pin button only on hover
  const handleTogglePin = async (id: string) => {
    setPinnedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]
    );
    // Save pin/unpin to backend for current user
    try {
      await fetch(`${API_URL}/chat/pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getAuthHeaders() as any),
        },
        body: JSON.stringify({
          messageId: id,
          userId: currentUserId,
          action: pinnedIds.includes(id) ? 'unpin' : 'pin',
        }),
      });
    } catch {}
  };


  // ----- Search & filtered view -----
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const q = searchQuery.trim().toLowerCase();
    return messages.filter((m) => (m.text || '').toLowerCase().includes(q));
  }, [messages, searchQuery]);

  // ----- UI helpers -----

  // دالة للحصول على اسم المستخدم من قائمة الكونتاكتس أو من البيانات المُرسَلة
  const getUserDisplayName = (replyTo: ChatMessage['replyTo']): string => {
    // إذا لم يكن هناك replyTo
    if (!replyTo) return 'مستخدم';

    let sender:
      | string
      | { _id: string; firstName: string; lastName?: string }
      | null = null;

    // إذا كان replyTo هو object يحتوي على sender
    if (typeof replyTo === 'object' && 'sender' in replyTo) {
      sender = replyTo.sender;
    }

    // إذا كان المُرسِل object يحتوي على الاسم
    if (typeof sender === 'object' && sender?.firstName) {
      return `${sender.firstName} ${sender.lastName || ''}`;
    }

    // إذا كان المُرسِل مجرد ID، ابحث عنه في قائمة الكونتاكتس
    const senderId = sender && typeof sender === 'object' ? sender._id : sender;
    if (senderId) {
      const contact = contacts.find((c) => c._id === senderId);
      if (contact) {
        return `${contact.firstName} ${contact.lastName || ''}`;
      }

      // إذا كان المُرسِل هو المستخدم الحالي
      if (senderId === currentUserId) {
        return `${currentUser?.firstName || 'أنت'} ${currentUser?.lastName || ''}`;
      }
    }

    // fallback
    return 'مستخدم';
  };

  const bubbleMine = (m: ChatMessage) => {
    const senderId = typeof m.sender === 'object' ? m.sender._id : m.sender;
    return senderId === (currentUserId || 'me');
  };
  const renderReactions = (m: ChatMessage) => {
    if (!m.reactions) return null;
    const entries = Object.entries(m.reactions);
    if (!entries.length) return null;
    return (
      <div className="mt-1 flex gap-1 flex-wrap">
        {entries.map(([emo, users]) => (
          <span
            key={emo}
            className="px-2 py-0.5 text-xs rounded-full bg-white/60 border border-gray-200"
          >
            {emo} {users.length}
          </span>
        ))}
      </div>
    );
  };

  const renderAttachments = (atts?: Attachment[]) => {
    if (!atts?.length) return null;
    return (
      <div className="mt-2 flex flex-col gap-2">
        {atts.map((a, i) =>
          a.type === 'image' ? (
            <a key={i} href={a.url} target="_blank" rel="noreferrer">
              <img
                src={a.url}
                alt={a.name || 'image'}
                className="max-h-56 rounded-lg shadow"
              />
            </a>
          ) : a.type === 'audio' ? (
            <audio key={i} src={a.url} controls className="w-64" />
          ) : (
            <a
              key={i}
              href={a.url}
              target="_blank"
              rel="noreferrer"
              className="underline text-emerald-700"
            >
              {a.name || 'ملف'}
            </a>
          )
        )}
      </div>
    );
  };

  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  // دالة لعرض حالة الرسائل بالألوان المطلوبة
  const renderMessageStatus = (message: ChatMessage) => {
    // عدم عرض حالة للرسائل التي لم أرسلها أنا
    const senderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
    if (senderId !== currentUserId) return null;

    if (message.__error) {
      return (
        <div className="flex items-center gap-1" title="فشل في الإرسال">
          <span className="text-red-500 text-sm">⚠️</span>
          <span className="text-xs text-red-400">فشل</span>
        </div>
      );
    }

    if (message.__pending) {
      return (
        <div className="flex items-center gap-1" title="جاري الإرسال">
          <span className="text-yellow-500 text-sm animate-pulse">⏳</span>
          <span className="text-xs text-yellow-400">جاري الإرسال</span>
        </div>
      );
    }

    // إذا كانت مقروءة - صحين أزرق فاتح
    if (message.read) {
      const readTime = message.readAt ? new Date(message.readAt) : null;
      return (
        <div className="flex items-center gap-1" title={`قُرئت ${readTime ? `في ${readTime.toLocaleTimeString('ar-SA')}` : ''}`}>
          <span className="text-blue-500 text-sm font-bold">✓✓</span>
          <span className="text-xs text-blue-400">مقروءة</span>
        </div>
      );
    }

    // إذا وصلت والمستلم متصل - صح واحد أخضر
    if (message.delivered && message.recipientOnline) {
      const deliveredTime = message.deliveredAt ? new Date(message.deliveredAt) : null;
      return (
        <div className="flex items-center gap-1" title={`وُصلت ${deliveredTime ? `في ${deliveredTime.toLocaleTimeString('ar-SA')}` : ''}`}>
          <span className="text-green-500 text-sm font-bold">✓</span>
          <span className="text-xs text-green-400">وُصلت</span>
        </div>
      );
    }

    // إذا وصلت والمستلم غير متصل - صح واحد برتقالي
    if (message.delivered) {
      const deliveredTime = message.deliveredAt ? new Date(message.deliveredAt) : null;
      return (
        <div className="flex items-center gap-1" title={`وُصلت (المستقبل غير متصل) ${deliveredTime ? `في ${deliveredTime.toLocaleTimeString('ar-SA')}` : ''}`}>
          <span className="text-orange-400 text-sm font-bold">✓</span>
          <span className="text-xs text-orange-300">وُصلت</span>
        </div>
      );
    }

    // مرسلة فقط - صح واحد رمادي فاتح
    return (
      <div className="flex items-center gap-1" title="مُرسلة">
        <span className="text-gray-300 text-sm font-bold">✓</span>
        <span className="text-xs text-gray-400">مُرسلة</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative p-2 md:p-6" dir="rtl">
      {/* Background */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 800 600"
      >
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="80%">
            <stop offset="0%" stopColor="#d1fae5" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0.8" />
          </radialGradient>
        </defs>
        <rect width="800" height="600" fill="url(#bgGrad)" />
        <circle cx="700" cy="100" r="80" fill="#10B981" fillOpacity="0.08" />
        <circle cx="100" cy="500" r="60" fill="#059669" fillOpacity="0.07" />
      </svg>

      <div className="max-w-6xl mx-auto bg-white rounded-xl md:rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm border border-white/20 relative z-10">
        <div className="flex flex-col md:flex-row min-h-[80vh]">
          {/* Left Pane */}
          <div className="w-full md:w-1/3 border-l border-gray-100">
            <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-600 p-3 text-white font-bold shadow-lg flex items-center gap-2">
              <div className="text-lg font-bold">{currentUser?.firstName} {currentUser?.lastName || ''}</div>
            </div>

            {/* Search */}
            <div className="px-3 pt-3">
              <input
                className="w-full rounded-xl border px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="ابحث داخل المحادثة الحالية…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="p-3 md:p-4 max-h-[50vh] md:max-h-none overflow-y-auto chat-scroll">
              {loading ? (
                <div>جارٍ التحميل...</div>
              ) : contacts.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-600">لا توجد جهات اتصال</p>
                  <p className="text-xs text-gray-400 mt-1">سيتم عرض جهات الاتصال من قاعدة البيانات هنا</p>
                </div>
              ) : (
                <>
                  <ul className="h-[500px] overflow-y-auto">
                    {[...contacts]
                      .sort((a, b) =>
                        `${a.firstName} ${a.lastName}`.localeCompare(
                          `${b.firstName} ${b.lastName}`,
                          'ar'
                        )
                      )
                      .map((c) => (
                        <li
                          key={c._id}
                          className={`flex items-center justify-between p-3 rounded-xl cursor-pointer ${
                            selectedContact?._id === c._id
                              ? 'bg-white border-2 border-emerald-200'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => {
                            setSelectedContact({ ...c });
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <ChatAvatar
                                user={c}
                                size="md"
                                className="ring-2 ring-white/30"
                                showStatus={true}
                                isActive={c.isActive}
                              />
                            </div>
                            <div>
                              <div className="font-medium">
                                {c.firstName} {c.lastName || ''}
                              </div>
                              <div className="text-xs text-gray-500">
                                {onlineUsers.has(c._id) 
                                  ? "متصل" 
                                  : lastSeenData.has(c._id)
                                    ? `آخر ظهور ${formatLastSeen(lastSeenData.get(c._id)!)}`
                                    : "آخر ظهور غير محدد"
                                }
                              </div>
                              {c.group && (
                                <div className="text-xs text-gray-400">
                                  {c.group}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {c.unread ? (
                              <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                                {c.unread}
                              </span>
                            ) : null}
                          </div>
                        </li>
                      ))}
                  </ul>
                </>
              )}
            </div>
          </div>

          {/* Conversation */}
          <div className="flex-1 flex flex-col">
            <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-600 p-4 text-white flex items-center gap-3 shadow-lg">
              {/* Chat header: show online status and full name only if a contact is selected */}
              <div className="relative">
                <ChatAvatar
                  user={selectedContact}
                  size="md"
                  className=""
                  showStatus={true}
                  isActive={selectedContact?.isActive}
                />
              </div>
              <div className="flex-1">
                <div className="font-bold">
                  {selectedContact
                    ? `${selectedContact.firstName} ${selectedContact.lastName || ''}`
                    : 'المحادثات'}
                </div>
                <div className="text-xs">
                  {selectedContact
                    ? peerTyping
                      ? 'يكتب الآن…'
                      : onlineUsers.has(selectedContact._id)
                        ? 'متصل'
                        : lastSeenData.has(selectedContact._id)
                          ? `آخر ظهور ${formatLastSeen(lastSeenData.get(selectedContact._id)!)}`
                          : 'آخر ظهور غير محدد'
                    : 'اختر محادثة لبدء التواصل'}
                </div>
              </div>
              {selectedContact && (
                <button
                  onClick={() =>
                    setPinnedIds((prev) => (prev.length ? [] : prev))
                  }
                  className="bg-white/20 text-white px-3 py-1 rounded"
                  title="عرض الرسائل المثبتة"
                >
                  المثبتة ({pinnedIds.length})
                </button>
              )}
            </div>

            {/* Pinned messages bar */}
            {pinnedIds.length > 0 && (
              <div className="px-3 py-2 bg-amber-50 border-b border-amber-200 text-amber-900 text-sm">
                <div className="flex gap-2 overflow-x-auto">
                  {pinnedIds.map((id) => {
                    const pm = messages.find((m) => m._id === id);
                    if (!pm) return null;
                    return (
                      <button
                        key={id}
                        className="px-3 py-1 rounded-full bg-white border hover:bg-amber-100"
                        onClick={() => {
                          setHighlightedId(id);
                          document
                            .getElementById(`msg-${id}`)
                            ?.scrollIntoView({
                              behavior: 'smooth',
                              block: 'center',
                            });
                          window.setTimeout(() => setHighlightedId(null), 1200);
                        }}
                        title={pm.text}
                      >
                        📌{' '}
                        {pm.text?.slice(0, 24) ||
                          (pm.attachments?.[0]?.name ?? 'مرفق')}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Messages */}
            <div
              ref={scrollContainerRef}
              className="h-[400px] md:h-[500px] p-3 md:p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white chat-scroll"
            >
              {selectedContact ? (
                <div className="h-full">
                  <div className="space-y-4 min-h-full flex flex-col justify-end">
                    {filteredMessages.length === 0 ? (
                      <div className="text-center text-gray-400 py-10">
                        لا توجد رسائل مطابقة
                      </div>
                    ) : (
                      (() => {
                        let lastDate: string | null = null;
                        return filteredMessages.map((m) => {
                          const msgDate = new Date(
                            m.createdAt
                          ).toLocaleDateString();
                          const showDate = lastDate !== msgDate;
                          lastDate = msgDate;
                          const mine = bubbleMine(m);
                          return (
                            <React.Fragment key={m._id}>
                              {showDate && (
                                <div className="flex justify-center my-2">
                                  <span className="bg-white text-gray-500 px-4 py-1 rounded-full shadow text-xs border border-gray-100">
                                    {msgDate}
                                  </span>
                                </div>
                              )}
                              <div
                                className={`flex ${mine ? 'justify-end' : 'justify-start'} mb-3 group relative`}
                                id={`msg-${m._id}`}
                              >
                                {mine ? (
                                  <>
                                    {/* للرسائل الخضراء: 1. Reply+خيارات, 2. رسالة, 3. وقت */}
                                    {/* 1. ديف Reply + 3 نقاط أولاً */}
                                    <div className="flex items-center gap-1 relative">
                                      <button
                                        className="p-1 rounded-full hover:bg-green-100 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                        title="رد"
                                        onClick={() => handleReply(m)}
                                      >
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                          />
                                        </svg>
                                      </button>

                                      <button
                                        className="p-1 rounded-full hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                        onClick={() =>
                                          setActionMenuOpen(
                                            m._id === actionMenuOpen
                                              ? null
                                              : m._id
                                          )
                                        }
                                        title="خيارات"
                                      >
                                        <svg
                                          className="w-4 h-4 text-gray-500"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                        </svg>
                                      </button>

                                      {actionMenuOpen === m._id && (
                                        <div className="absolute top-8 right-0 bg-transparent border-0 rounded-xl z-50 min-w-[120px] flex flex-col text-right animate-fade-in">
                                          <button
                                            className="px-4 py-2 hover:bg-white/90 text-gray-800 text-sm rounded-lg mb-1 backdrop-blur-sm border border-gray-200/50"
                                            onClick={() => {
                                              handleTogglePin(m._id);
                                              setActionMenuOpen(null);
                                            }}
                                          >
                                            📌 تثبيت
                                          </button>
                                          <button
                                            className="px-4 py-2 hover:bg-white/90 text-gray-800 text-sm rounded-lg mb-1 backdrop-blur-sm border border-gray-200/50"
                                            onClick={() => {
                                              editMessage(m);
                                              setActionMenuOpen(null);
                                            }}
                                          >
                                            ✏️ تعديل
                                          </button>
                                          <button
                                            className="px-4 py-2 hover:bg-white/90 text-red-600 text-sm rounded-lg mb-1 backdrop-blur-sm border border-gray-200/50"
                                            onClick={() => {
                                              deleteMessage(m);
                                              setActionMenuOpen(null);
                                            }}
                                          >
                                            🗑️ حذف
                                          </button>
                                          <button
                                            className="px-4 py-2 hover:bg-white/90 text-gray-800 text-sm rounded-lg backdrop-blur-sm border border-gray-200/50"
                                            onClick={() =>
                                              setActionMenuOpen(null)
                                            }
                                          >
                                            إغلاق
                                          </button>
                                        </div>
                                      )}
                                    </div>

                                    {/* 2. ديف الرسالة الأخضر */}
                                    <div className="max-w-[85%]">
                                      {/* شارة أعلى الفقاعة: "قمت بالرد على ..." */}
                                      {m.replyTo && (
                                        <div className="mb-0.5 text-right">
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-transparent text-black border-0 opacity-70">
                                            <svg
                                              className="w-3 h-3 text-black"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                              stroke="currentColor"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                              />
                                            </svg>
                                            {(() => {
                                              const me =
                                                typeof currentUser ===
                                                  'object' && currentUser
                                                  ? getEntityId(currentUser)
                                                  : null;
                                              const repliedId =
                                                typeof m.replyTo === 'object' &&
                                                m.replyTo.sender
                                                  ? typeof m.replyTo.sender ===
                                                    'object'
                                                    ? m.replyTo.sender._id
                                                    : m.replyTo.sender
                                                  : null;
                                              const repliedName =
                                                getUserDisplayName(m.replyTo);
                                              return me === repliedId
                                                ? 'قمت بالرد على نفسك'
                                                : `قمت بالرد على ${repliedName}`;
                                            })()}
                                          </span>
                                        </div>
                                      )}

                                      <div className="px-4 py-2 rounded-2xl shadow-md transition-all duration-200 backdrop-blur-sm bg-green-500/75 text-white border border-green-400/25 min-h-[35px]">
                                        {m.text && (
                                          <p className="whitespace-pre-line break-all text-xs leading-tight max-w-[250px]">
                                            {searchQuery
                                              ? m.text
                                                  .split(
                                                    new RegExp(
                                                      `(${searchQuery})`,
                                                      'gi'
                                                    )
                                                  )
                                                  .map((part, i) =>
                                                    part.toLowerCase() ===
                                                    searchQuery.toLowerCase() ? (
                                                      <mark
                                                        key={i}
                                                        className="bg-yellow-200 rounded px-1"
                                                      >
                                                        {part}
                                                      </mark>
                                                    ) : (
                                                      <span key={i}>
                                                        {part}
                                                      </span>
                                                    )
                                                  )
                                              : m.text}
                                            {m.editedAt && (
                                              <span className="ml-2 text-xs opacity-75 italic">
                                                (معدل)
                                              </span>
                                            )}
                                          </p>
                                        )}
                                        {renderAttachments(m.attachments)}
                                        {renderReactions(m)}

                                        <div className="mt-0.5 text-right">
                                          <span className="text-[10px] opacity-70">
                                            {renderMessageStatus(m)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* 3. ديف الوقت للرسائل الخضراء */}
                                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                      <div className="bg-black/80 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap shadow-lg backdrop-blur-sm">
                                        {new Date(
                                          m.createdAt
                                        ).toLocaleTimeString('ar-EG', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    {/* للرسائل الرمادية: Avatar + اسم المرسل + رسالة + خيارات */}
                                    {/* 1. Avatar واسم المرسل */}
                                    <div className="flex items-start gap-2 max-w-[85%]">
                                      <ChatAvatar
                                        user={typeof m.sender === 'object' ? m.sender : contacts.find(c => c._id === m.sender) || null}
                                        size="sm"
                                        className="flex-shrink-0 mt-1"
                                      />
                                      <div className="flex flex-col flex-1 min-w-0">
                                        <div className="text-xs text-gray-600 mb-1 font-medium">
                                          {typeof m.sender === 'object' 
                                            ? `${m.sender.firstName} ${m.sender.lastName || ''}` 
                                            : (contacts.find(c => c._id === m.sender) 
                                                ? `${contacts.find(c => c._id === m.sender)?.firstName} ${contacts.find(c => c._id === m.sender)?.lastName || ''}` 
                                                : 'مستخدم'
                                              )
                                          }
                                        </div>
                                        {/* نص الرد - يظهر فوق الرسالة */}
                                        {m.replyTo && (
                                          <div className="mb-0.5 text-left">
                                            <span className="text-xs text-gray-500 font-normal bg-transparent px-2 py-0.5 rounded-full opacity-70">
                                              {(() => {
                                                const currentUserId =
                                                  typeof currentUser ===
                                                    'object' && currentUser
                                                    ? getEntityId(currentUser)
                                                    : null;
                                                const repliedToUserId =
                                                  typeof m.replyTo === 'object' &&
                                                  m.replyTo.sender
                                                    ? typeof m.replyTo.sender ===
                                                      'object'
                                                      ? m.replyTo.sender._id
                                                      : m.replyTo.sender
                                                    : null;
                                                const repliedToUserName =
                                                  getUserDisplayName(m.replyTo);

                                                if (
                                                  currentUserId ===
                                                  repliedToUserId
                                                ) {
                                                  return 'رد على نفسه';
                                                } else {
                                                  return `رد على ${repliedToUserName}`;
                                                }
                                              })()
                                              }
                                            </span>
                                          </div>
                                        )}

                                      <div className="px-6 py-3 rounded-2xl shadow-md transition-all duration-200 backdrop-blur-sm bg-gray-100/85 text-gray-800 border border-gray-300/40 min-h-[50px]">
                                        {m.text && (
                                          <p className="whitespace-pre-line break-all text-sm leading-relaxed max-w-[400px]">
                                            {searchQuery
                                              ? m.text
                                                  .split(
                                                    new RegExp(
                                                      `(${searchQuery})`,
                                                      'gi'
                                                    )
                                                  )
                                                  .map((part, i) =>
                                                    part.toLowerCase() ===
                                                    searchQuery.toLowerCase() ? (
                                                      <mark
                                                        key={i}
                                                        className="bg-yellow-200 rounded px-1"
                                                      >
                                                        {part}
                                                      </mark>
                                                    ) : (
                                                      <span key={i}>
                                                        {part}
                                                      </span>
                                                    )
                                                  )
                                              : m.text}
                                            {m.editedAt && (
                                              <span className="ml-2 text-xs opacity-75 italic">
                                                (معدل)
                                              </span>
                                            )}
                                          </p>
                                        )}
                                        {renderAttachments(m.attachments)}
                                        {renderReactions(m)}
                                        </div>
                                      </div>
                                    </div>

                                    {/* وقت الرسالة عند hover */}
                                    <div className="absolute -right-1 top-3/4 -translate-y-1/4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                      <div className="bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap shadow-lg backdrop-blur-sm">
                                        {new Date(
                                          m.createdAt
                                        ).toLocaleTimeString('ar-EG', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </div>
                                    </div>

                                    {/* 3. ديف Reply + 3 نقاط */}
                                    <div className="flex items-center gap-1 relative">
                                      <button
                                        className="p-1 rounded-full hover:bg-gray-100 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                        title="رد"
                                        onClick={() => handleReply(m)}
                                      >
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                          />
                                        </svg>
                                      </button>

                                      <button
                                        className="p-1 rounded-full hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                        onClick={() =>
                                          setActionMenuOpen(
                                            m._id === actionMenuOpen
                                              ? null
                                              : m._id
                                          )
                                        }
                                        title="خيارات"
                                      >
                                        <svg
                                          className="w-4 h-4 text-gray-500"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                        </svg>
                                      </button>

                                      {actionMenuOpen === m._id && (
                                        <div className="absolute top-8 left-0 bg-transparent border-0 rounded-xl z-50 min-w-[120px] flex flex-col text-right animate-fade-in">
                                          <button
                                            className="px-4 py-2 hover:bg-white/90 text-gray-800 text-sm rounded-lg mb-1 backdrop-blur-sm border border-gray-200/50"
                                            onClick={() => {
                                              handleTogglePin(m._id);
                                              setActionMenuOpen(null);
                                            }}
                                          >
                                            📌 تثبيت
                                          </button>
                                          <button
                                            className="px-4 py-2 hover:bg-white/90 text-gray-800 text-sm rounded-lg backdrop-blur-sm border border-gray-200/50"
                                            onClick={() =>
                                              setActionMenuOpen(null)
                                            }
                                          >
                                            إغلاق
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            </React.Fragment>
                          );
                        });
                      })()
                    )}
                    {peerTyping && (
                      <div className="flex justify-start">
                        <div className="px-3 py-2 rounded-2xl shadow bg-gradient-to-r from-gray-100 to-green-100 text-gray-800 flex items-center gap-2">
                          <span className="animate-bounce">...</span>
                          <span className="text-xs text-gray-500">
                            يكتب الآن
                          </span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-emerald-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      اختر محادثة لبدء التواصل
                    </h3>
                    <p className="text-gray-500">
                      قم بتحديد شخص أو مجموعة من القائمة
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="p-3 md:p-4 border-t border-gray-200 bg-white shadow-lg relative">
              {/* Reply preview - تصميم محسن مثل الصورة */}
              {replyTo && (
                <div className="mb-3 bg-white border-r-4 border-emerald-500 shadow-sm rounded-l-lg overflow-hidden animate-slide-down">
                  <div className="flex items-center justify-between p-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <svg
                          className="w-4 h-4 text-emerald-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                          />
                        </svg>
                        <span className="text-xs font-semibold text-emerald-600">
                          رد على:
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2 pr-6">
                        {replyTo.text || 'رسالة'}
                      </p>
                      <div className="text-xs text-gray-500 mt-1">
                        {typeof replyTo.sender === 'object'
                          ? `${replyTo.sender.firstName} ${replyTo.sender.lastName || ''}`
                          : (contacts.find((c) => c._id === replyTo.sender)
                              ? `${contacts.find((c) => c._id === replyTo.sender)?.firstName} ${contacts.find((c) => c._id === replyTo.sender)?.lastName || ''}`
                              : `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`
                            ) || 'مستخدم'}{' '}
                        • منذ{' '}
                        {new Date(replyTo.createdAt).toLocaleTimeString(
                          'ar-EG',
                          { hour: '2-digit', minute: '2-digit' }
                        )}
                      </div>
                    </div>
                    <button
                      onClick={cancelReply}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                      title="إلغاء الرد"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              {/* Attachment previews */}
              {attachments.length > 0 && (
                <div className="mb-3 flex gap-3 flex-wrap">
                  {attachments.map((a, i) => (
                    <div
                      key={i}
                      className="relative border rounded-xl p-2 bg-gray-50"
                    >
                      {a.type === 'image' ? (
                        <img
                          src={a.url}
                          alt={a.name}
                          className="h-20 w-20 object-cover rounded-lg"
                        />
                      ) : a.type === 'audio' ? (
                        <audio src={a.url} controls className="w-48" />
                      ) : (
                        <div className="w-48 truncate">{a.name || 'ملف'}</div>
                      )}
                      <button
                        className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full"
                        onClick={() =>
                          setAttachments((prev) =>
                            prev.filter((_, idx) => idx !== i)
                          )
                        }
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2 md:gap-3 items-end"
              >
                {/* ...existing code... */}

                <label
                  className="px-3 py-3 rounded-2xl border hover:bg-gray-50 cursor-pointer flex items-center justify-center"
                  title="إرفاق"
                  style={{ width: 44, height: 44, padding: 0 }}
                >
                  <FiPaperclip size={24} color="#059669" />
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    onChange={(e) => onFilesSelected(e.target.files)}
                    accept="image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  />
                </label>

                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`px-3 py-3 rounded-2xl border hover:bg-gray-50 flex items-center justify-center ${isRecording ? 'animate-pulse border-red-400' : ''}`}
                  title="رسالة صوتية"
                  style={{ width: 44, height: 44, padding: 0 }}
                >
                  <FiMic
                    size={24}
                    color={isRecording ? '#dc2626' : '#059669'}
                  />
                </button>

                <input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 p-3 md:p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 text-base placeholder-gray-400 bg-gray-50 focus:bg-white shadow-sm"
                  placeholder={
                    selectedContact ? 'اكتب رسالتك هنا...' : 'اختر محادثة أولاً'
                  }
                  disabled={!selectedContact}
                />
                <button
                  type="submit"
                  className="hidden md:inline-block bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 md:px-6 py-3 md:py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-sm md:text-base disabled:opacity-50 flex items-center gap-2"
                  disabled={
                    !selectedContact ||
                    (!messageInput.trim() && attachments.length === 0) ||
                    uploading
                  }
                >
                  <span className="flex items-center gap-1">
                    {uploading ? 'يرفع...' : 'إرسال'}
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="19" y1="12" x2="5" y2="12"></line>
                      <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                  </span>
                </button>

                {/* Floating send for mobile */}
                <button
                  type="button"
                  className="md:hidden fixed bottom-8 right-8 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 rounded-full font-bold shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                  onClick={sendMessage}
                  disabled={
                    !selectedContact ||
                    (!messageInput.trim() && attachments.length === 0) ||
                    uploading
                  }
                >
                  <span className="flex items-center gap-1">
                    إرسال
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="19" y1="12" x2="5" y2="12"></line>
                      <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                  </span>
                </button>

                {/* Success indicator */}
                {sendSuccess && (
                  <div className="fixed bottom-24 right-8 z-50 bg-green-500 text-white px-6 py-3 rounded-full shadow-xl font-bold animate-bounce">
                    تم الإرسال بنجاح
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ...existing code... */}
    </div>
  );
};

export default Chat;
