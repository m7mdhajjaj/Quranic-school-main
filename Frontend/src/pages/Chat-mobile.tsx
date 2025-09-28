import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { API_URL } from "../config";
import Avatar from "../components/Avatar";
import { getUserGender } from "../hooks/useAvatar";

interface Contact {
  _id: string;
  firstName: string;
  lastName?: string;
  group?: string;
  unread?: number;
}

interface Message {
  _id: string;
  sender: string;
  text: string;
  createdAt: string;
  read?: boolean;
  delivered?: boolean;
  deliveredAt?: string;
  readAt?: string;
  recipientOnline?: boolean;
  __pending?: boolean;
  __error?: boolean;
}

const Chat: React.FC = () => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedUserInfo, setSelectedUserInfo] = useState<Contact | null>(
    null,
  );
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showContactList, setShowContactList] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Load current user from localStorage
  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    if (rawUser) {
      try {
        const u = JSON.parse(rawUser);
        setCurrentUser(u);
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
      }
    }
  }, []);

  // Fetch contacts when currentUser is loaded
  useEffect(() => {
    if (!currentUser) return;
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const authHeader = getAuthHeaders();
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if ((authHeader as any).Authorization)
          headers.Authorization = (authHeader as any).Authorization as string;

        let url = "";
        if (currentUser.role === "teacher") {
          url = `${API_URL}/students`;
        } else {
          const studentId = getEntityId(currentUser);
          url = `${API_URL}/teachers/for-student/${studentId}`;
        }

        const resp = await fetch(url, { headers });
        if (resp.ok) {
          const data = await resp.json();
          setContacts(data);
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, [currentUser]);

  // Helper functions
  const getEntityId = (obj: any): string => {
    if (!obj) return "";
    if (obj._id) return obj._id.toString();
    if (obj.id) return obj.id.toString();
    if (obj.teacherId) return String(obj.teacherId);
    if (obj.studentId) return String(obj.studentId);
    if (obj.userId) return String(obj.userId);
    if (typeof obj.toString === "function") return obj.toString();
    return "";
  };

  const getModelName = (role?: string): string => {
    if (role === "teacher") return "Teacher";
    return "Student";
  };

  const getAuthHeaders = () => {
    const rawUser = localStorage.getItem("user");
    let token = localStorage.getItem("token") || "";
    if (!token && rawUser) {
      try {
        const u = JSON.parse(rawUser);
        token = u?.token || u?.accessToken || "";
      } catch (e) {
        token = "";
      }
    }
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // WebSocket connection and message handling
  useEffect(() => {
    if (!currentUser) return;

    socketRef.current = io(API_URL.replace("/api", ""), {
      transports: ["websocket", "polling"],
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected");
      const userId = getEntityId(currentUser);
      socketRef.current?.emit("join", userId);
    });

    socketRef.current.on("newMessage", (msg) => {
      const incoming = {
        _id: msg._id || Date.now().toString(),
        sender: getEntityId(msg.sender) || msg.senderId || msg.sender || "",
        text: msg.text || "",
        createdAt: msg.createdAt || new Date().toISOString(),
      };

      if (selectedContact && incoming.sender === getEntityId(selectedContact)) {
        setMessages((prev) => [...prev, incoming]);
      } else {
        setContacts((prev) =>
          prev.map((c) =>
            c._id === incoming.sender
              ? { ...c, unread: (c.unread || 0) + 1 }
              : c,
          ),
        );
      }

      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        50,
      );
    });

    socketRef.current.on("messageSent", (savedMsg) => {
      if (!savedMsg) return;
      const normalized = {
        _id: savedMsg._id || Date.now().toString(),
        sender: getEntityId(savedMsg.sender) || getEntityId(currentUser) || "",
        text: savedMsg.text || "",
        createdAt: savedMsg.createdAt || new Date().toISOString(),
        delivered: savedMsg.delivered ?? false,
        deliveredAt: savedMsg.deliveredAt,
        recipientOnline: savedMsg.recipientOnline ?? false,
        read: savedMsg.read ?? false,
      };

      setMessages((prev) => {
        const tmpIndex = prev.findIndex(
          (m) =>
            m._id.startsWith("tmp-") &&
            m.text === normalized.text &&
            m.sender === normalized.sender,
        );
        if (tmpIndex !== -1) {
          const copy = [...prev];
          copy[tmpIndex] = normalized;
          return copy;
        }
        return [...prev, normalized];
      });

      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        50,
      );
    });

    // حدث توصيل الرسالة
    socketRef.current.on("messageDelivered", ({ messageId, recipientOnline }) => {
      setMessages((prev) => prev.map(m => 
        m._id === messageId 
          ? { 
              ...m, 
              delivered: true, 
              deliveredAt: new Date().toISOString(), 
              recipientOnline 
            } 
          : m
      ));
    });

    // حدث قراءة الرسالة
    socketRef.current.on("messageRead", ({ messageId }) => {
      setMessages((prev) => prev.map(m => 
        m._id === messageId 
          ? { 
              ...m, 
              read: true, 
              readAt: new Date().toISOString() 
            } 
          : m
      ));
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [currentUser, selectedContact]);

  // Load conversation when contact changes
  useEffect(() => {
    const loadConversation = async () => {
      if (!currentUser || !selectedContact) return;

      try {
        const senderId = getEntityId(currentUser);
        const senderType = getModelName(currentUser.role);
        const recipientId = getEntityId(selectedContact);
        const recipientType = senderType === "Teacher" ? "Student" : "Teacher";
        const authHeader = getAuthHeaders();
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if ((authHeader as any).Authorization)
          headers.Authorization = (authHeader as any).Authorization as string;

        const url = `${API_URL}/chat/conversation/${senderId}/${senderType}/${recipientId}/${recipientType}`;
        const response = await fetch(url, { headers });

        if (response.ok) {
          const data = await response.json();
          setMessages(data || []);
          setTimeout(
            () =>
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
            100,
          );
        }
      } catch (error) {
        console.error("Error loading conversation:", error);
      }
    };

    loadConversation();
  }, [currentUser, selectedContact]);

  const sendMessage = () => {
    if (!messageInput.trim() || !selectedContact) return;

    const payload = {
      sender: getEntityId(currentUser) || "local",
      senderModel: getModelName(currentUser?.role),
      recipient: getEntityId(selectedContact),
      recipientModel:
        getModelName(currentUser?.role) === "Teacher" ? "Student" : "Teacher",
      text: messageInput.trim(),
      senderName: currentUser?.firstName || "",
    };

    const tempMsg = {
      _id: `tmp-${Date.now()}`,
      sender: payload.sender,
      text: payload.text,
      createdAt: new Date().toISOString(),
      __pending: true,
      delivered: false,
      read: false,
    };

    setMessages((prev) => [...prev, tempMsg]);

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("sendMessage", payload);
    }

    setMessageInput("");
    setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  };

  // دالة لعرض حالة الرسائل بالألوان المطلوبة
  const renderMessageStatus = (message: Message, isCurrentUser: boolean) => {
    // عرض الحالة فقط للرسائل المرسلة من المستخدم الحالي
    if (!isCurrentUser) return null;

    if (message.__error) {
      return <span className="text-red-500 text-xs mr-2 font-bold">⚠️</span>;
    }
    
    if (message.__pending) {
      return <span className="text-yellow-500 text-xs mr-2 font-bold">⏳</span>;
    }
    
    // إذا كانت مقروءة - صحين أزرق فاتح
    if (message.read) {
      return <span className="text-blue-400 text-xs mr-2 font-bold">✓✓</span>;
    }
    
    // إذا وصلت والمستلم متصل - صح واحد أخضر
    if (message.delivered && message.recipientOnline) {
      return <span className="text-green-500 text-xs mr-2 font-bold">✓</span>;
    }
    
    // إذا وصلت والمستلم غير متصل - صح واحد برتقالي
    if (message.delivered) {
      return <span className="text-orange-400 text-xs mr-2 font-bold">✓</span>;
    }
    
    // مرسلة فقط - صح واحد رمادي فاتح
    return <span className="text-gray-300 text-xs mr-2 font-bold">✓</span>;
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100 p-2 md:p-4"
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto bg-white rounded-xl md:rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm border border-white/20">
        {/* Mobile Header */}
        <div className="md:hidden bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-600 p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowContactList(!showContactList)}
                className="p-2 bg-white/20 rounded-lg"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <div>
                <h2 className="font-bold text-lg">
                  {selectedContact
                    ? `${selectedContact.firstName} ${
                        selectedContact.lastName || ""
                      }`
                    : "المحادثات"}
                </h2>
                <p className="text-emerald-100 text-sm">
                  {selectedContact ? "متصل الآن" : "اختر محادثة للبدء"}
                </p>
              </div>
            </div>
            {selectedContact && (
              <button
                onClick={() => setSelectedUserInfo(selectedContact)}
                className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row h-[calc(100vh-5rem)] md:h-[calc(100vh-2rem)]">
          {/* Contact Sidebar */}
          <div
            className={`${
              showContactList ? "flex" : "hidden"
            } md:flex md:w-1/3 flex-col border-l border-gray-100 bg-gradient-to-b from-gray-50 to-white ${
              showContactList
                ? "absolute md:relative inset-0 z-10 md:z-auto"
                : ""
            }`}
          >
            {/* Desktop Header */}
            <div className="hidden md:block bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-600 p-6 text-white shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6"
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
                <div>
                  <h2 className="font-bold text-lg">قائمة المحادثات</h2>
                  <p className="text-emerald-100 text-sm">اختر محادثة للبدء</p>
                </div>
              </div>
            </div>

            {/* Mobile Contact Header */}
            <div className="md:hidden bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-600 p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5"
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
                  <h2 className="font-bold text-lg">قائمة المحادثات</h2>
                </div>
                <button
                  onClick={() => setShowContactList(false)}
                  className="p-2 bg-white/20 rounded-lg"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 p-3 md:p-4 overflow-y-auto chat-scroll">
              {loading ? (
                <div className="flex items-center justify-center h-32 animate-fadeIn">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                  <span className="mr-3 text-gray-600">جارٍ التحميل...</span>
                </div>
              ) : contacts.length === 0 ? (
                <div className="text-center text-gray-500 py-8 animate-fadeIn">
                  <svg
                    className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm md:text-base">لا يوجد محادثات</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {contacts.map((c, index) => (
                    <div
                      key={c._id}
                      className={`flex items-center justify-between p-3 md:p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] animate-slideIn ${
                        selectedContact?._id === c._id
                          ? "bg-gradient-to-r from-emerald-50 to-teal-50 shadow-md border-2 border-emerald-200"
                          : "hover:bg-gray-50 border-2 border-transparent"
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => {
                        setSelectedContact(c);
                        setShowContactList(false);
                      }}
                    >
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="relative">
                          <Avatar
                            userName={c.firstName}
                            gender={getUserGender(c)}
                            size="lg"
                            className="shadow-lg"
                          />
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse-slow"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-800 text-base md:text-lg truncate">
                            {c.firstName} {c.lastName}
                          </div>
                          {c.group && (
                            <div className="text-xs md:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md inline-block mt-1 truncate max-w-full">
                              {c.group}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                        {c.unread ? (
                          <span className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-xs font-bold shadow-lg animate-bounce-in">
                            {c.unread}
                          </span>
                        ) : (
                          <div className="w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full shadow-sm animate-pulse-slow"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div
            className={`flex-1 flex flex-col ${
              showContactList ? "hidden md:flex" : "flex"
            }`}
          >
            {selectedContact ? (
              <>
                {/* Desktop Chat Header */}
                <div className="hidden md:block bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-600 p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar
                          userName={selectedContact.firstName}
                          gender={getUserGender(selectedContact)}
                          size="xl"
                          className="shadow-lg"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                      </div>
                      <div>
                        <h3 className="font-bold text-xl">
                          {selectedContact.firstName}{" "}
                          {selectedContact.lastName || ""}
                        </h3>
                        <p className="text-emerald-100 text-sm">متصل الآن</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedUserInfo(selectedContact)}
                      className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
                    >
                      معلومات المستخدم
                    </button>
                  </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-b from-gray-50 to-white">
                  <div className="max-w-4xl mx-auto">
                    {messages.length === 0 ? (
                      <div className="text-center py-12 animate-fadeIn">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg
                            className="w-8 h-8 md:w-10 md:h-10 text-emerald-500"
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
                        <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
                          ابدأ محادثة جديدة
                        </h3>
                        <p className="text-gray-500 text-sm md:text-base">
                          اكتب رسالتك الأولى لبدء المحادثة
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message, index) => {
                          const isCurrentUser =
                            message.sender === getEntityId(currentUser);
                          return (
                            <div
                              key={message._id}
                              className={`flex ${
                                isCurrentUser ? "justify-start" : "justify-end"
                              } animate-slideIn`}
                              style={{ animationDelay: `${index * 0.05}s` }}
                            >
                              <div
                                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 md:px-6 py-3 md:py-4 rounded-2xl shadow-lg chat-bubble ${
                                  isCurrentUser
                                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                                    : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800"
                                }`}
                              >
                                <p className="text-sm md:text-base leading-relaxed">
                                  {message.text}
                                </p>
                                <div className={`flex items-center justify-between text-xs mt-2 ${
                                  isCurrentUser
                                    ? "text-emerald-100"
                                    : "text-gray-500"
                                }`}>
                                  <span>
                                    {new Date(
                                      message.createdAt,
                                    ).toLocaleTimeString("ar-EG", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                  {renderMessageStatus(message, isCurrentUser)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 bg-white p-4 md:p-6 shadow-lg">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage();
                    }}
                    className="flex gap-3 md:gap-4 items-end"
                  >
                    <div className="flex-1 relative">
                      <input
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        className="w-full p-3 md:p-4 pr-10 md:pr-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 text-base md:text-lg placeholder-gray-400 bg-gray-50 focus:bg-white shadow-sm message-input"
                        placeholder="اكتب رسالتك هنا..."
                        disabled={!selectedContact}
                      />
                      <div className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2">
                        <svg
                          className="w-4 h-4 md:w-5 md:h-5 text-gray-400"
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
                    </div>
                    <button
                      type="submit"
                      disabled={!messageInput.trim() || !selectedContact}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 md:px-6 py-3 md:py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 text-sm md:text-base"
                    >
                      إرسال
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full animate-fadeIn">
                <div className="text-center">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-in">
                    <svg
                      className="w-10 h-10 md:w-12 md:h-12 text-emerald-500"
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
                  <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
                    اختر محادثة لبدء التواصل
                  </h3>
                  <p className="text-gray-500 text-sm md:text-base">
                    قم بتحديد شخص من قائمة المحادثات لبدء التراسل
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Info Modal */}
      {selectedUserInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-bounce-in">
            <h3 className="text-xl font-bold mb-4">معلومات المستخدم</h3>
            <p>
              <strong>الاسم:</strong> {selectedUserInfo.firstName}{" "}
              {selectedUserInfo.lastName}
            </p>
            {selectedUserInfo.group && (
              <p>
                <strong>المجموعة:</strong> {selectedUserInfo.group}
              </p>
            )}
            <button
              onClick={() => setSelectedUserInfo(null)}
              className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors w-full"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
