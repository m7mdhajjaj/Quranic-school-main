import { useState, useEffect, useRef } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

interface Message {
  id: number;
  sender: "student" | "teacher";
  text: string;
  timestamp: string;
}

const Chat = () => {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "teacher",
      text: "السلام عليكم ورحمة الله وبركاته",
      timestamp: "10:00",
    },
    {
      id: 2,
      sender: "teacher",
      text: "أهلاً بك في منصة التواصل، كيف يمكنني مساعدتك اليوم؟",
      timestamp: "10:01",
    },
    {
      id: 3,
      sender: "student",
      text: "وعليكم السلام ورحمة الله وبركاته، أستاذي الكريم",
      timestamp: "10:05",
    },
  ]);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });

    scrollToBottom();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now(),
        sender: "student",
        text: message,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages([...messages, newMessage]);
      setMessage("");
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4"
      dir="rtl">
      <div className="container mx-auto max-w-3xl">
        <div
          className="bg-white rounded-xl shadow-lg overflow-hidden"
          data-aos="fade-up">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-4">
            <div className="flex items-center">
              <div className="bg-white p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div className="mr-3">
                <h2 className="text-white text-xl font-bold">
                  التواصل مع المعلم
                </h2>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm mr-2">متصل الآن</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-4 bg-gray-50">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "student" ? "justify-start" : "justify-end"
                  }`}>
                  <div
                    className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                      msg.sender === "student"
                        ? "bg-emerald-600 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}>
                    <p>{msg.text}</p>
                    <div
                      className={`text-xs mt-1 ${
                        msg.sender === "student"
                          ? "text-emerald-100"
                          : "text-gray-500"
                      }`}>
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-gray-200">
            <div className="flex">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                className="flex-1 p-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="bg-emerald-600 text-white p-3 rounded-l-lg hover:bg-emerald-700 transition duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 transform rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </form>

          {/* Quick Response Buttons */}
          <div className="p-3 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setMessage("نعم، فهمت الدرس")}
                className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm hover:bg-gray-100 transition">
                نعم، فهمت الدرس
              </button>
              <button
                onClick={() => setMessage("أحتاج مساعدة في الواجب")}
                className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm hover:bg-gray-100 transition">
                أحتاج مساعدة في الواجب
              </button>
              <button
                onClick={() => setMessage("متى سيكون الامتحان القادم؟")}
                className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm hover:bg-gray-100 transition">
                متى سيكون الامتحان القادم؟
              </button>
            </div>
          </div>
        </div>

        {/* Usage Guidelines */}
        <div
          className="mt-6 bg-white p-4 rounded-lg shadow-md"
          data-aos="fade-up"
          data-aos-delay="200">
          <h3 className="font-bold text-gray-700 mb-2">
            تعليمات استخدام المحادثة:
          </h3>
          <ul className="text-gray-600 text-sm list-disc pr-5 space-y-1">
            <li>يرجى الالتزام بآداب الحوار واحترام المعلم</li>
            <li>استخدم المحادثة للاستفسارات المتعلقة بالدروس والواجبات</li>
            <li>وقت الرد: خلال ساعات العمل من 8 صباحاً - 4 مساءً</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Chat;
