import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import UserInfoModal from "../components/UserInfoModal";

interface Contact {
  _id: string;
  firstName: string;
  lastName?: string;
  group?: string;
  unread?: number;
}

interface User {
  _id: string;
  firstName: string;
  role?: string;
}

const API_URL = "http://localhost:5005/api";
const SOCKET_URL = "http://localhost:5005";

const Chat: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedUserInfo, setSelectedUserInfo] = useState<Contact | null>(
    null
  );
  const [messages, setMessages] = useState<
    Array<{ _id: string; sender: string; text: string; createdAt: string }>
  >([]);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (!userJson) return;
    try {
      const parsed = JSON.parse(userJson) as User;
      setCurrentUser(parsed);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const role = (currentUser.role || "").toLowerCase();

    const loadForTeacher = async () => {
      setLoading(true);
      try {
        const resp = await fetch(`${API_URL}/students`);
        if (!resp.ok) throw new Error("Failed");
        const data = await resp.json();
        const list = Array.isArray(data)
          ? data.map((s: any) => ({
              _id: s._id || s.id,
              firstName: s.firstName || s.name || "",
              lastName: s.lastName || "",
              group: s.group || s.section || "",
              unread: s.unread || 0,
            }))
          : [];
        setContacts(list);
      } catch (err) {
        setContacts([]);
      } finally {
        setLoading(false);
      }
    };

    const loadForStudent = async () => {
      setLoading(true);
      try {
        // Use the specific endpoint to get teachers for this student
        const studentId = getEntityId(currentUser);
        const resp = await fetch(
          `${API_URL}/teachers/for-student/${studentId}`
        );
        if (resp.ok) {
          const data = await resp.json();
          const list = Array.isArray(data)
            ? data.map((t: any) => ({
                _id: t._id || t.id,
                firstName: t.firstName || t.name || "Teacher",
                lastName: t.lastName || "",
                group: Array.isArray(t.groups) ? t.groups.join(", ") : "",
                unread: t.unread || 0,
              }))
            : [];
          if (list.length === 0) {
            // Fallback to all teachers if no specific teachers found
            const allTeachersResp = await fetch(`${API_URL}/teachers`);
            if (allTeachersResp.ok) {
              const allTeachersData = await allTeachersResp.json();
              const allTeachersList = Array.isArray(allTeachersData)
                ? allTeachersData.map((t: any) => ({
                    _id: t._id || t.id,
                    firstName: t.firstName || t.name || "Teacher",
                    lastName: t.lastName || "",
                    group: Array.isArray(t.groups) ? t.groups.join(", ") : "",
                    unread: t.unread || 0,
                  }))
                : [];
              setContacts(allTeachersList);
              if (allTeachersList.length > 0) {
                setSelectedContact(allTeachersList[0]);
              }
            } else {
              // Final fallback to admin
              const admin = {
                _id: "teacher-1001",
                firstName: "محمد",
                lastName: "حجاج",
                group: "",
                unread: 0,
              };
              setContacts([admin]);
              setSelectedContact(admin);
            }
          } else {
            setContacts(list);
            setSelectedContact(list[0]);
          }
        } else {
          // Fallback to all teachers
          const allTeachersResp = await fetch(`${API_URL}/teachers`);
          if (allTeachersResp.ok) {
            const allTeachersData = await allTeachersResp.json();
            const allTeachersList = Array.isArray(allTeachersData)
              ? allTeachersData.map((t: any) => ({
                  _id: t._id || t.id,
                  firstName: t.firstName || t.name || "Teacher",
                  lastName: t.lastName || "",
                  group: Array.isArray(t.groups) ? t.groups.join(", ") : "",
                  unread: t.unread || 0,
                }))
              : [];
            setContacts(allTeachersList);
            if (allTeachersList.length > 0) {
              setSelectedContact(allTeachersList[0]);
            }
          } else {
            const admin = {
              _id: "teacher-1001",
              firstName: "محمد",
              lastName: "حجاج",
              group: "",
              unread: 0,
            };
            setContacts([admin]);
            setSelectedContact(admin);
          }
        }
      } catch (err) {
        const admin = {
          _id: "teacher-1001",
          firstName: "Admin",
          lastName: "User",
          group: "",
          unread: 0,
        };
        setContacts([admin]);
        setSelectedContact(admin);
      } finally {
        setLoading(false);
      }
    };

    if (role === "teacher" || role === "admin") loadForTeacher();
    else loadForStudent();
  }, [currentUser]);

  const getModelName = (role?: string) => {
    if (!role) return "Student";
    return role.toLowerCase().includes("teacher") ||
      role.toLowerCase().includes("admin")
      ? "Teacher"
      : "Student";
  };

  const getEntityId = (obj: any) => {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    // mongoose ObjectId may be an object with toString()
    if (obj._id) return obj._id.toString();
    if (obj.id) return obj.id.toString();
    if (obj.teacherId) return String(obj.teacherId);
    if (obj.studentId) return String(obj.studentId);
    if (obj.userId) return String(obj.userId);
    if (typeof obj.toString === "function") return obj.toString();
    return "";
  };

  const getAuthHeaders = () => {
    // Try common places for token
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

  // Fetch conversation when contact changes to persist messages across refresh
  useEffect(() => {
    const loadConversation = async () => {
      if (!currentUser || !selectedContact) return;
      console.log(
        "Loading conversation for:",
        getEntityId(currentUser),
        "to",
        getEntityId(selectedContact)
      );
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
        console.log(
          "Fetching conversation from:",
          url,
          "with headers:",
          headers
        );
        const resp = await fetch(url, { headers });
        console.log("Fetch response status:", resp.status);
        if (!resp.ok) {
          console.error("Failed to load conversation:", resp.statusText);
          setMessages([]);
          return;
        }
        const data = await resp.json();
        console.log("Conversation data received:", data);
        // normalize messages
        const list = Array.isArray(data)
          ? data.map((m: any) => ({
              _id: m._id,
              sender: getEntityId(m.sender) || m.sender,
              text: m.text,
              createdAt: m.createdAt || m.createdAt,
            }))
          : [];
        console.log("Normalized messages:", list);
        setMessages(list);
        setTimeout(
          () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
          50
        );
      } catch (err) {
        console.error("Error loading conversation:", err);
        // ignore
      }
    };

    loadConversation();
  }, [selectedContact, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on("connect", () => {
      socketRef.current?.emit("login", {
        userId: getEntityId(currentUser),
        role: currentUser.role || "student",
      });
    });

    socketRef.current.on("receiveMessage", (msg) => {
      console.debug("socket receiveMessage raw:", msg);
      const incoming = {
        _id: msg._id || Date.now().toString(),
        sender: getEntityId(msg.sender) || msg.senderId || msg.sender || "",
        text: msg.text || "",
        createdAt: msg.createdAt || new Date().toISOString(),
      };

      console.log("Processed incoming message:", incoming);
      console.log("Current selectedContact:", selectedContact);
      console.log("Selected contact ID:", getEntityId(selectedContact));
      console.log("Incoming sender ID:", incoming.sender);
      console.log(
        "Should show message:",
        selectedContact && incoming.sender === getEntityId(selectedContact)
      );

      // if message is from currently open contact, append to view
      if (selectedContact && incoming.sender === getEntityId(selectedContact)) {
        console.log("Adding message to current conversation");
        setMessages((prev) => [...prev, incoming]);
      } else {
        console.log(
          "Message not for current conversation, updating unread count"
        );
        // increment unread for matching contact or add notification
        setContacts((prev) =>
          prev.map((c) =>
            c._id === incoming.sender
              ? { ...c, unread: (c.unread || 0) + 1 }
              : c
          )
        );
      }

      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        50
      );
    });

    // When server confirms a sent message was saved, replace temp message or append
    socketRef.current.on("messageSent", (savedMsg) => {
      console.debug("socket messageSent raw:", savedMsg);
      if (!savedMsg) return;
      const normalized = {
        _id: savedMsg._id || Date.now().toString(),
        sender:
          getEntityId(savedMsg.sender) ||
          getEntityId(currentUser) ||
          savedMsg.senderId ||
          savedMsg.sender ||
          "",
        text: savedMsg.text || "",
        createdAt: savedMsg.createdAt || new Date().toISOString(),
      };

      setMessages((prev) => {
        // find first temporary message that matches by text and sender
        const tmpIndex = prev.findIndex(
          (m) =>
            m._id &&
            String(m._id).startsWith("tmp-") &&
            m.text === normalized.text &&
            m.sender === normalized.sender
        );
        if (tmpIndex !== -1) {
          const copy = [...prev];
          copy[tmpIndex] = normalized;
          return copy;
        }
        // otherwise append
        return [...prev, normalized];
      });

      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        50
      );
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
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

    // optimistic UI - add a temporary message so sender sees it immediately
    const tempMsg = {
      _id: `tmp-${Date.now()}`,
      sender: payload.sender,
      text: payload.text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);

    if (socketRef.current && socketRef.current.connected) {
      console.debug("emit sendMessage payload:", payload);
      socketRef.current.emit("sendMessage", payload);
    } else {
      // fallback: persist via REST API if socket not connected
      (async () => {
        try {
          const authHeader = getAuthHeaders();
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
          };
          if ((authHeader as any).Authorization)
            headers.Authorization = (authHeader as any).Authorization as string;
          const resp = await fetch(`${API_URL}/chat`, {
            method: "POST",
            headers,
            body: JSON.stringify({ ...payload, isGroupMessage: false }),
          });
          if (resp.ok) {
            const saved = await resp.json();
            // replace temp
            setMessages((prev) => {
              const idx = prev.findIndex((m) => m._id === tempMsg._id);
              const copy = [...prev];
              if (idx !== -1)
                copy[idx] = {
                  _id: saved._id,
                  sender: saved.sender,
                  text: saved.text,
                  createdAt: saved.createdAt,
                };
              else
                copy.push({
                  _id: saved._id,
                  sender: saved.sender,
                  text: saved.text,
                  createdAt: saved.createdAt,
                });
              return copy;
            });
          }
        } catch (e) {
          // ignore
        }
      })();
    }

    setMessageInput("");
    setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      50
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6" dir="rtl">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow overflow-hidden">
        <div className="flex">
          <div className="w-1/3 border-l">
            <div className="bg-emerald-600 p-4 text-white font-bold">
              قائمة المحادثات
            </div>
            <div className="p-4">
              {loading ? (
                <div>جارٍ التحميل...</div>
              ) : contacts.length === 0 ? (
                <div className="text-gray-500">لا يوجد محادثات</div>
              ) : (
                <ul>
                  {contacts.map((c) => (
                    <li
                      key={c._id}
                      className={`flex items-center justify-between p-3 rounded hover:bg-gray-50 cursor-pointer ${
                        selectedContact?._id === c._id ? "bg-emerald-50" : ""
                      }`}
                      onClick={() => setSelectedContact(c)}>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                          style={{
                            background:
                              "linear-gradient(135deg,#10B981,#059669)",
                          }}>
                          {(c.firstName || "").charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">
                            {c.firstName} {c.lastName}
                          </div>
                          <div className="text-xs text-gray-500">{c.group}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.unread ? (
                          <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                            {c.unread}
                          </span>
                        ) : (
                          <span className="w-2 h-2 bg-green-400 rounded-full" />
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-emerald-600 p-4 text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                {(selectedContact?.firstName || " ").charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-bold">
                  {selectedContact
                    ? `${selectedContact.firstName} ${
                        selectedContact.lastName || ""
                      }`
                    : "المحادثات"}
                </div>
                <div className="text-xs">
                  {selectedContact ? "متصل الآن" : "اختر محادثة لبدء التواصل"}
                </div>
              </div>
              {selectedContact && (
                <button
                  onClick={() => setSelectedUserInfo(selectedContact)}
                  className="bg-white/20 text-white px-3 py-1 rounded">
                  Info
                </button>
              )}
            </div>

            <div className="p-4 h-[500px] overflow-auto">
              {selectedContact ? (
                <div>
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <>
                        <div className="max-w-xs bg-gray-200 p-3 rounded">
                          مرحباً، يمكنك الآن مراسلة المعلم.
                        </div>
                      </>
                    ) : (
                      messages.map((m) => (
                        <div
                          key={m._id}
                          className={`flex ${
                            m.sender === (currentUser?._id || "me")
                              ? "justify-end"
                              : "justify-start"
                          }`}>
                          <div
                            className={`max-w-xs p-3 rounded-lg ${
                              m.sender === (currentUser?._id || "me")
                                ? "bg-emerald-600 text-white"
                                : "bg-gray-200 text-gray-800"
                            }`}>
                            <p>{m.text}</p>
                            <div className="text-xs mt-1 text-gray-500">
                              {new Date(m.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 mt-24">
                  اختر محادثة لبدء التواصل
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2">
                <input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 p-2 border rounded"
                  placeholder="اكتب رسالتك هنا..."
                />
                <button
                  type="submit"
                  className="bg-emerald-600 text-white px-4 py-2 rounded">
                  إرسال
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {selectedUserInfo && (
        <UserInfoModal
          user={selectedUserInfo}
          userRole={"student"}
          onClose={() => setSelectedUserInfo(null)}
        />
      )}
    </div>
  );
};

export default Chat;
