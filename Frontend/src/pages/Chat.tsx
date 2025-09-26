import Footer from "../components/Footer";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
// If you add shadcn/ui you can replace basic elements with nicer components.
import UserInfoModal from "../components/UserInfoModal";

type AttachmentType = "image" | "file" | "audio";

interface Attachment {
  url: string;
  name?: string;
  type: AttachmentType;
  size?: number;
  durationSec?: number;
}

interface ChatMessage {
  _id: string;
  sender: string;                 // userId
  text?: string;
  createdAt: string;
  read?: boolean;
  editedAt?: string;
  reactions?: Record<string, string[]>; // emoji -> [userIds]
  attachments?: Attachment[];
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
}

interface User {
  _id: string;
  firstName: string;
  role?: string;
  imageUrl?: string;
}

const API_URL = "http://localhost:5005/api";
const SOCKET_URL = "http://localhost:5005";

// Lazy load emoji picker (install any: emoji-mart, emoji-picker-react, etc.)
const EmojiPicker = React.lazy(() => import(/* webpackIgnore: true */ "emoji-picker-react").catch(() => ({ default: () => null })));

const Chat: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Left pane
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Contact[]>([]); // { _id: groupName, isGroup: true }
  const [listTab, setListTab] = useState<"direct" | "group">("direct");
  const [loading, setLoading] = useState(false);

  // Conversation
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Compose
  const [messageInput, setMessageInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  // Presence
  const [isTyping, setIsTyping] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const [peerOnline, setPeerOnline] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // ----- Helpers -----
  const getModelName = (role?: string) => {
    if (!role) return "Student";
    return role.toLowerCase().includes("teacher") || role.toLowerCase().includes("admin")
      ? "Teacher"
      : "Student";
  };

  const getEntityId = (obj: any) => {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    if (obj._id) return String(obj._id);
    if (obj.id) return String(obj.id);
    if (obj.teacherId) return String(obj.teacherId);
    if (obj.studentId) return String(obj.studentId);
    if (obj.userId) return String(obj.userId);
    if (typeof obj.toString === "function") return obj.toString();
    return "";
  };

  const getAuthHeaders = () => {
    const rawUser = localStorage.getItem("user");
    let token = localStorage.getItem("token") || "";
    if (!token && rawUser) {
      try {
        const u = JSON.parse(rawUser);
        token = u?.token || u?.accessToken || "";
      } catch {}
    }
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const currentUserId = getEntityId(currentUser);
  const selectedId = getEntityId(selectedContact);
  const isGroupChat = !!selectedContact?.isGroup;

  // ----- Load current user & notification deep-link -----
  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        setCurrentUser(JSON.parse(userJson));
      } catch {}
    }
    const chatNotifRaw = localStorage.getItem("chatNotification");
    if (chatNotifRaw) {
      try {
        const n = JSON.parse(chatNotifRaw);
        setSelectedContact({
          _id: n.recipientId || n.senderId,
          firstName: "محادثة تلقائية",
          lastName: "",
          group: "",
          unread: 0,
        });
      } catch {}
      localStorage.removeItem("chatNotification");
    }
  }, []);

  // ----- Load contacts & groups -----
  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      setLoading(true);
      try {
        const role = (currentUser.role || "").toLowerCase();
        if (role === "teacher" || role === "admin") {
          // Students list for teacher
          const resp = await fetch(`${API_URL}/students`, { headers: { ...getAuthHeaders() } });
          const data = resp.ok ? await resp.json() : [];
          const list: Contact[] = Array.isArray(data)
            ? data.map((s: any) => ({
                _id: s._id || s.id,
                firstName: s.firstName || s.name || "",
                lastName: s.lastName || "",
                group: s.group || s.section || "",
                unread: s.unread || 0,
              }))
            : [];
          setContacts(list);
        } else {
          // Teachers for this student (you had a custom route before; here we fallback gracefully)
          const studentId = getEntityId(currentUser);
          const trySpecific = await fetch(`${API_URL}/teachers/for-student/${studentId}`, { headers: { ...getAuthHeaders() } });
          let list: Contact[] = [];
          if (trySpecific.ok) {
            const data = await trySpecific.json();
            list = (Array.isArray(data) ? data : []).map((t: any) => ({
              _id: t._id || t.id,
              firstName: t.firstName || t.name || "Teacher",
              lastName: t.lastName || "",
              group: Array.isArray(t.groups) ? t.groups.join(", ") : "",
              unread: t.unread || 0,
            }));
          }
          if (list.length === 0) {
            const allTeachers = await fetch(`${API_URL}/teachers`, { headers: { ...getAuthHeaders() } });
            if (allTeachers.ok) {
              const data = await allTeachers.json();
              list = (Array.isArray(data) ? data : []).map((t: any) => ({
                _id: t._id || t.id,
                firstName: t.firstName || t.name || "Teacher",
                lastName: t.lastName || "",
                group: Array.isArray(t.groups) ? t.groups.join(", ") : "",
                unread: t.unread || 0,
              }));
            }
          }
          if (list.length === 0) {
            list = [{ _id: "teacher-1001", firstName: "محمد", lastName: "حجاج", group: "", unread: 0 }];
          }
          setContacts(list);
          if (!selectedContact && list.length) setSelectedContact(list[0]);
        }

        // Example groups list — replace with your actual groups source
        // If you have Teacher.groups or Student.group you can populate from there
        setGroups([
          { _id: "Group-A", firstName: "مجموعة", lastName: "A", group: "A", isGroup: true },
          { _id: "Group-B", firstName: "مجموعة", lastName: "B", group: "B", isGroup: true },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentUser]);

  // ----- Load conversation -----
  const loadConversation = async () => {
    if (!currentUser || !selectedContact) return;
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json", ...getAuthHeaders() as any };
      if (isGroupChat) {
        // Group history
        const resp = await fetch(`${API_URL}/chat/group/${encodeURIComponent(selectedContact._id)}`, { headers });
        const data = resp.ok ? await resp.json() : [];
        const list: ChatMessage[] = Array.isArray(data)
          ? data.map((m: any) => ({
              _id: m._id,
              sender: getEntityId(m.sender) || m.sender,
              text: m.text,
              createdAt: m.createdAt,
              read: m.read,
              // attachments(optional): server support later
            }))
          : [];
        setMessages(list);
      } else {
        const senderId = getEntityId(currentUser);
        const senderType = getModelName(currentUser.role);
        const recipientId = getEntityId(selectedContact);
        const recipientType = senderType === "Teacher" ? "Student" : "Teacher";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContact, currentUser]);

  // ----- Socket -----
  useEffect(() => {
    if (!currentUser) return;
    const s = io(SOCKET_URL);
    socketRef.current = s;

    s.on("connect", () => {
      s.emit("login", { userId: currentUserId, role: currentUser?.role || "student" });
    });

    // Presence
    s.on("presence:update", (payload: { userId: string; online: boolean }) => {
      if (selectedContact && payload.userId === selectedId) {
        setPeerOnline(payload.online);
      }
    });

    s.on("typing", (payload: { from: string; to?: string; group?: string }) => {
      if (!selectedContact) return;
      if (isGroupChat) {
        if (payload.group === selectedContact._id) setPeerTyping(true);
      } else {
        if (payload.from === selectedId) setPeerTyping(true);
      }
      window.setTimeout(() => setPeerTyping(false), 1500);
    });

    // Receive new message
    s.on("receiveMessage", (msg: any) => {
      const incoming: ChatMessage = {
        _id: msg._id || Date.now().toString(),
        sender: getEntityId(msg.sender) || msg.senderId || msg.sender || "",
        text: msg.text || "",
        createdAt: msg.createdAt || new Date().toISOString(),
        read: msg.read ?? false,
        attachments: msg.attachments || undefined,
      };
      const belongsToThisChat = isGroupChat
        ? msg.isGroupMessage && (msg.group === selectedContact?._id)
        : !msg.isGroupMessage && (incoming.sender === selectedId || incoming.sender === currentUserId); // basic check
      if (selectedContact && belongsToThisChat) {
        setMessages(prev => [...prev, incoming]);
        // mark as read soon after render
        window.setTimeout(markVisibleAsRead, 300);
      } else {
        // bump unread for corresponding contact
        setContacts(prev => prev.map(c => (c._id === incoming.sender ? { ...c, unread: (c.unread || 0) + 1 } : c)));
      }
      scrollToBottomSmooth();
    });

    // Server ack for sent message
    s.on("messageSent", (saved: any) => {
      if (!saved) return;
      const normalized: ChatMessage = {
        _id: saved._id || Date.now().toString(),
        sender: getEntityId(saved.sender) || currentUserId || saved.senderId || saved.sender || "",
        text: saved.text || "",
        createdAt: saved.createdAt || new Date().toISOString(),
        read: saved.read ?? false,
        attachments: saved.attachments || undefined,
        __pending: false,
      };
      setMessages(prev => {
        const idx = prev.findIndex(m => String(m._id).startsWith("tmp-") && (m.text || "") === (normalized.text || ""));
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
    s.on("reactionUpdated", ({ messageId, emoji, users }: { messageId: string; emoji: string; users: string[] }) => {
      setMessages(prev =>
        prev.map(m => (m._id === messageId ? { ...m, reactions: { ...(m.reactions || {}), [emoji]: users } } : m))
      );
    });

    // Edits/Deletes
    s.on("messageEdited", (m: any) => {
      setMessages(prev => prev.map(msg => (msg._id === m._id ? { ...msg, text: m.text, editedAt: m.editedAt } : msg)));
    });
    s.on("messageDeleted", ({ messageId }: { messageId: string }) => {
      setMessages(prev => prev.filter(m => m._id !== messageId));
    });

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, selectedContact]);

  // ----- Scrolling & read receipts -----
  const scrollToBottomSmooth = () => {
    window.setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const markVisibleAsRead = async () => {
    // collect messages not mine & not read
    const toMark = messages.filter(m => m.sender !== currentUserId && !m.read).map(m => m._id);
    if (toMark.length === 0) return;
    try {
      await fetch(`${API_URL}/chat/read`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(getAuthHeaders() as any) },
        body: JSON.stringify({ messageIds: toMark }),
      });
      setMessages(prev => prev.map(m => (toMark.includes(m._id) ? { ...m, read: true } : m)));
    } catch {}
  };

  // Mark on scroll end
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      // when near bottom, assume messages visible
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 60) markVisibleAsRead();
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
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
    socketRef.current.emit("typing", payload);
    typingTimeoutRef.current = window.setTimeout(() => setIsTyping(false), 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageInput]);

  // ----- Compose: emoji, uploads, voice -----
  const onPickEmoji = (emojiData: any) => {
    const emoji = emojiData?.emoji || emojiData?.native || "";
    setMessageInput(prev => prev + emoji);
  };

  const onFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const newAtts: Attachment[] = [];
      for (const f of Array.from(files)) {
        // Upload to your API (create an /upload endpoint that returns {url})
        // Fallback: create object URL (temporary) — replace with server URL after upload.
        const form = new FormData();
        form.append("file", f);
        // Try REST upload
        let url: string | null = null;
        try {
          const resp = await fetch(`${API_URL}/upload`, {
            method: "POST",
            headers: { ...(getAuthHeaders() as any) },
            body: form,
          });
          if (resp.ok) {
            const data = await resp.json();
            url = data.url;
          }
        } catch {}
        if (!url) url = URL.createObjectURL(f); // temporary preview

        const type: AttachmentType = f.type.startsWith("image/")
          ? "image"
          : f.type.startsWith("audio/")
          ? "audio"
          : "file";
        newAtts.push({ url, name: f.name, size: f.size, type });
      }
      setAttachments(prev => [...prev, ...newAtts]);
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
      rec.ondataavailable = e => audioChunksRef.current.push(e.data);
      rec.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
        // Upload as any other file
        await onFilesSelected({ 0: file, length: 1, item: (i: number) => (i === 0 ? file : null) } as unknown as FileList);
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
    mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop());
    setIsRecording(false);
  };

  // ----- Send message -----
  const sendMessage = async () => {
    if ((!messageInput.trim() && attachments.length === 0) || !selectedContact) return;

    const payload: any = {
      sender: currentUserId || "local",
      senderModel: getModelName(currentUser?.role),
      text: messageInput.trim() || undefined,
      attachments: attachments.length ? attachments : undefined, // server: add to schema if desired
    };

    if (isGroupChat) {
      payload.isGroupMessage = true;
      payload.group = selectedContact._id; // server expects group name/id
    } else {
      payload.recipient = selectedId;
      payload.recipientModel = getModelName(currentUser?.role) === "Teacher" ? "Student" : "Teacher";
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
      __pending: true,
    };
    setMessages(prev => [...prev, temp]);
    setMessageInput("");
    setAttachments([]);
    scrollToBottomSmooth();

    // Send via socket if connected
    if (socketRef.current?.connected) {
      socketRef.current.emit("sendMessage", payload);
    } else {
      // REST fallback
      try {
        const headers: Record<string, string> = { ...(getAuthHeaders() as any) };
        const resp = await fetch(`${API_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify(payload),
        });
        if (resp.ok) {
          const saved = await resp.json();
          setMessages(prev => {
            const idx = prev.findIndex(m => m._id === temp._id);
            const copy = [...prev];
            const normalized: ChatMessage = {
              _id: saved._id,
              sender: getEntityId(saved.sender) || currentUserId,
              text: saved.text,
              createdAt: saved.createdAt,
              read: saved.read ?? false,
              attachments: saved.attachments || temp.attachments,
            };
            if (idx !== -1) copy[idx] = normalized;
            else copy.push(normalized);
            return copy;
          });
        } else {
          setMessages(prev => prev.map(m => (m._id === temp._id ? { ...m, __pending: false, __error: true } : m)));
        }
      } catch {
        setMessages(prev => prev.map(m => (m._id === temp._id ? { ...m, __pending: false, __error: true } : m)));
      }
    }
  };

  // ----- Message actions: react, edit, delete, pin -----
  const toggleReaction = (messageId: string, emoji: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("reactMessage", { messageId, emoji, userId: currentUserId }); // TODO server
  };

  const editMessage = async (m: ChatMessage) => {
    const newText = window.prompt("تعديل الرسالة:", m.text || "");
    if (newText == null) return;
    // Optimistic UI
    setMessages(prev => prev.map(x => (x._id === m._id ? { ...x, text: newText, editedAt: new Date().toISOString() } : x)));
    // Socket &/or REST
    socketRef.current?.emit("editMessage", { messageId: m._id, text: newText }); // TODO server
    try {
      await fetch(`${API_URL}/chat/${m._id}`, { method: "PATCH", headers: { "Content-Type": "application/json", ...(getAuthHeaders() as any) }, body: JSON.stringify({ text: newText }) }); // TODO server route
    } catch {}
  };

  const deleteMessage = async (m: ChatMessage) => {
    if (!window.confirm("هل تريد حذف الرسالة؟")) return;
    setMessages(prev => prev.filter(x => x._id !== m._id));
    socketRef.current?.emit("deleteMessage", { messageId: m._id }); // TODO server
    try {
      await fetch(`${API_URL}/chat/${m._id}`, { method: "DELETE", headers: { ...(getAuthHeaders() as any) } }); // TODO server route
    } catch {}
  };

  const togglePin = (id: string) => {
    setPinnedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [id, ...prev]));
    socketRef.current?.emit("pinMessage", { messageId: id, chatId: selectedId, isGroup: isGroupChat }); // TODO server
  };

  // ----- Search & filtered view -----
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const q = searchQuery.trim().toLowerCase();
    return messages.filter(m => (m.text || "").toLowerCase().includes(q));
  }, [messages, searchQuery]);

  // ----- UI helpers -----
  const bubbleMine = (m: ChatMessage) => m.sender === (currentUserId || "me");
  const renderReactions = (m: ChatMessage) => {
    if (!m.reactions) return null;
    const entries = Object.entries(m.reactions);
    if (!entries.length) return null;
    return (
      <div className="mt-1 flex gap-1 flex-wrap">
        {entries.map(([emo, users]) => (
          <span key={emo} className="px-2 py-0.5 text-xs rounded-full bg-white/60 border border-gray-200">
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
          a.type === "image" ? (
            <a key={i} href={a.url} target="_blank" rel="noreferrer">
              <img src={a.url} alt={a.name || "image"} className="max-h-56 rounded-lg shadow" />
            </a>
          ) : a.type === "audio" ? (
            <audio key={i} src={a.url} controls className="w-64" />
          ) : (
            <a key={i} href={a.url} target="_blank" rel="noreferrer" className="underline text-emerald-700">
              {a.name || "ملف"}
            </a>
          )
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen relative p-2 md:p-6" dir="rtl">
      {/* Background */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 800 600">
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
              <button
                className={`px-3 py-1 rounded-full text-sm ${listTab === "direct" ? "bg-white/20" : "hover:bg-white/10"}`}
                onClick={() => setListTab("direct")}
              >
                محادثات
              </button>
              <button
                className={`px-3 py-1 rounded-full text-sm ${listTab === "group" ? "bg-white/20" : "hover:bg-white/10"}`}
                onClick={() => setListTab("group")}
              >
                مجموعات
              </button>
              <div className="ml-auto text-xs opacity-90">{currentUser?.firstName}</div>
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
              ) : (
                <>
                  {listTab === "direct" ? (
                    <ul className="h-[500px] overflow-y-auto">
                      {[...contacts]
                        .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, "ar"))
                        .map((c) => (
                          <li
                            key={c._id}
                            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer ${
                              selectedContact?._id === c._id && !selectedContact?.isGroup
                                ? "bg-white border-2 border-emerald-200"
                                : "hover:bg-gray-50"
                            }`}
                            onClick={() => {
                              setSelectedContact({ ...c, isGroup: false });
                              setListTab("direct");
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold bg-gradient-to-br from-emerald-500 to-teal-600">
                                  {(c.firstName || "").charAt(0)}
                                </div>
                                <span className="absolute bottom-1 left-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                              </div>
                              <div>
                                <div className="font-medium">{c.firstName} {c.lastName}</div>
                                <div className="text-xs text-gray-500">{c.group}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {c.unread ? (
                                <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">{c.unread}</span>
                              ) : (
                                <span className="w-2 h-2 bg-green-400 rounded-full" />
                              )}
                            </div>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <ul className="h-[500px] overflow-y-auto">
                      {groups.map((g) => (
                        <li
                          key={g._id}
                          className={`flex items-center justify-between p-3 rounded-xl cursor-pointer ${
                            selectedContact?._id === g._id && selectedContact?.isGroup
                              ? "bg-white border-2 border-emerald-200"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            setSelectedContact({ ...g, isGroup: true });
                            setListTab("group");
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold bg-gradient-to-br from-teal-500 to-emerald-600">
                              {g.group?.charAt(0) || "G"}
                            </div>
                            <div>
                              <div className="font-medium">{g.firstName} {g.lastName}</div>
                              <div className="text-xs text-gray-500">#{g._id}</div>
                            </div>
                          </div>
                          <span className="w-2 h-2 bg-green-400 rounded-full" />
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Conversation */}
          <div className="flex-1 flex flex-col">
            <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-600 p-4 text-white flex items-center gap-3 shadow-lg">
              <div className="relative w-10 h-10">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  {(selectedContact?.firstName || " ").charAt(0)}
                </div>
                <span className={`absolute bottom-1 left-1 w-3 h-3 border-2 border-white rounded-full ${peerOnline ? "bg-green-400" : "bg-gray-300"}`}></span>
              </div>
              <div className="flex-1">
                <div className="font-bold">
                  {selectedContact ? `${selectedContact.firstName} ${selectedContact.lastName || ""}` : "المحادثات"}
                </div>
                <div className="text-xs">
                  {selectedContact ? (peerTyping ? "يكتب الآن…" : peerOnline ? "متصل الآن" : "غير متصل") : "اختر محادثة لبدء التواصل"}
                </div>
              </div>
              {selectedContact && (
                <button
                  onClick={() => setPinnedIds(prev => (prev.length ? [] : prev))}
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
                  {pinnedIds.map(id => {
                    const pm = messages.find(m => m._id === id);
                    if (!pm) return null;
                    return (
                      <button
                        key={id}
                        className="px-3 py-1 rounded-full bg-white border hover:bg-amber-100"
                        onClick={() => {
                          setHighlightedId(id);
                          document.getElementById(`msg-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                          window.setTimeout(() => setHighlightedId(null), 1200);
                        }}
                        title={pm.text}
                      >
                        📌 {pm.text?.slice(0, 24) || (pm.attachments?.[0]?.name ?? "مرفق")}
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
                      <div className="text-center text-gray-400 py-10">لا توجد رسائل مطابقة</div>
                    ) : (
                      (() => {
                        let lastDate: string | null = null;
                        return filteredMessages.map((m) => {
                          const msgDate = new Date(m.createdAt).toLocaleDateString();
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
                              <div className={`flex ${mine ? "justify-end" : "justify-start"}`} id={`msg-${m._id}`}>
                                <div
                                  className={`max-w-xs md:max-w-md lg:max-w-lg p-3 md:p-4 rounded-2xl shadow-lg transition-all duration-300 ${
                                    mine ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white" : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800"
                                  } ${highlightedId === m._id ? "ring-2 ring-amber-400" : ""}`}
                                >
                                  {/* Actions */}
                                  <div className={`mb-1 flex items-center ${mine ? "justify-end" : "justify-start"} gap-2 opacity-80`}>
                                    <button className="text-xs" onClick={() => toggleReaction(m._id, "👍")}>👍</button>
                                    <button className="text-xs" onClick={() => toggleReaction(m._id, "❤️")}>❤️</button>
                                    <button className="text-xs" onClick={() => toggleReaction(m._id, "😂")}>😂</button>
                                    <button className="text-xs" onClick={() => togglePin(m._id)}>📌</button>
                                    {mine && (
                                      <>
                                        <button className="text-xs underline" onClick={() => editMessage(m)}>تعديل</button>
                                        <button className="text-xs underline" onClick={() => deleteMessage(m)}>حذف</button>
                                      </>
                                    )}
                                  </div>

                                  {/* Body */}
                                  {m.text && (
                                    <p className="whitespace-pre-line break-words text-base">
                                      {searchQuery
                                        ? (m.text.split(new RegExp(`(${searchQuery})`, "gi")).map((part, i) =>
                                            part.toLowerCase() === searchQuery.toLowerCase() ? <mark key={i} className="bg-yellow-200">{part}</mark> : <span key={i}>{part}</span>
                                          ))
                                        : m.text}
                                      {m.editedAt && <span className="ml-2 text-xs opacity-75">(معدل)</span>}
                                    </p>
                                  )}
                                  {renderAttachments(m.attachments)}
                                  {renderReactions(m)}

                                  <div className={`text-xs mt-1 ${mine ? "text-emerald-50/80" : "text-gray-500"}`}>
                                    {new Date(m.createdAt).toLocaleTimeString()}{" "}
                                    {mine && (
                                      <span className="ml-2">
                                        {m.__error ? "⚠️ فشل" : m.__pending ? "⏳" : m.read ? "✓✓ مقروءة" : "✓ مرسلة"}
                                      </span>
                                    )}
                                  </div>
                                </div>
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
                          <span className="text-xs text-gray-500">يكتب الآن</span>
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
                      <svg className="w-10 h-10 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">اختر محادثة لبدء التواصل</h3>
                    <p className="text-gray-500">قم بتحديد شخص أو مجموعة من القائمة</p>
                  </div>
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="p-3 md:p-4 border-t border-gray-200 bg-white shadow-lg relative">
              {/* Attachment previews */}
              {attachments.length > 0 && (
                <div className="mb-3 flex gap-3 flex-wrap">
                  {attachments.map((a, i) => (
                    <div key={i} className="relative border rounded-xl p-2 bg-gray-50">
                      {a.type === "image" ? (
                        <img src={a.url} alt={a.name} className="h-20 w-20 object-cover rounded-lg" />
                      ) : a.type === "audio" ? (
                        <audio src={a.url} controls className="w-48" />
                      ) : (
                        <div className="w-48 truncate">{a.name || "ملف"}</div>
                      )}
                      <button
                        className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full"
                        onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
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
                <button
                  type="button"
                  onClick={() => setShowEmoji(v => !v)}
                  className="px-3 py-3 rounded-2xl border hover:bg-gray-50"
                  title="Emoji"
                >
                  😊
                </button>

                <label className="px-3 py-3 rounded-2xl border hover:bg-gray-50 cursor-pointer" title="إرفاق">
                  📎
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
                  className={`px-3 py-3 rounded-2xl border hover:bg-gray-50 ${isRecording ? "animate-pulse border-red-400" : ""}`}
                  title="رسالة صوتية"
                >
                  {isRecording ? "⏹️" : "🎙️"}
                </button>

                <input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 p-3 md:p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 text-base placeholder-gray-400 bg-gray-50 focus:bg-white shadow-sm"
                  placeholder={selectedContact ? "اكتب رسالتك هنا..." : "اختر محادثة أولاً"}
                  disabled={!selectedContact}
                />

                <button
                  type="submit"
                  className="hidden md:inline-block bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 md:px-6 py-3 md:py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-sm md:text-base disabled:opacity-50"
                  disabled={!selectedContact || (!messageInput.trim() && attachments.length === 0) || uploading}
                >
                  {uploading ? "يرفع..." : "إرسال"}
                </button>

                {/* Floating send for mobile */}
                <button
                  type="button"
                  className="md:hidden fixed bottom-8 right-8 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 rounded-full font-bold shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50"
                  onClick={sendMessage}
                  disabled={!selectedContact || (!messageInput.trim() && attachments.length === 0) || uploading}
                >
                  إرسال
                </button>
              </form>

              {/* Emoji picker popover */}
              {showEmoji && (
                <div className="absolute bottom-24 right-4 bg-white border rounded-xl shadow-2xl p-2 z-50 w-72 h-80 overflow-hidden">
                  <React.Suspense fallback={<div className="p-3 text-sm">جارٍ التحميل…</div>}>
                    {/* Works if you installed "emoji-picker-react". Otherwise renders null gracefully. */}
                    <EmojiPicker onEmojiClick={(_, e) => onPickEmoji(e)} />
                  </React.Suspense>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Optional user info modal */}
      {/* <UserInfoModal user={selectedUserInfo as any} userRole={"student"} onClose={() => setSelectedUserInfo(null)} /> */}
      <Footer />
    </div>
  );
};

export default Chat;
