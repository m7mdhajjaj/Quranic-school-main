import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageSquare, ChevronLeft, ChevronRight, Loader2, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../Api/api';

// Types for chat messages
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AiChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'السلام عليكم! أنا مساعدك لتفسير القرآن الكريم من المصادر المنسقة. يمكنك سؤالي عن تفسير أي آية (مثال: تفسير سورة الإخلاص).',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/ai-chat', { message: userMessage.content });

      if (response.data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'عذراً، حدث خطأ. يرجى المحاولة لاحقاً.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 z-50 p-4 rounded-full shadow-lg transition-all duration-300 bg-emerald-600 hover:bg-emerald-700 text-white ${
          isOpen ? 'translate-y-24 opacity-0' : 'translate-y-0 opacity-100'
        }`}
        aria-label="Toggle AI Chat"
      >
        <BookOpen size={24} />
      </button>

      {/* Chat Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-[100] border-l border-gray-200 flex flex-col"
            dir="rtl"
          >
            {/* Header */}
            <div className="bg-emerald-600 p-4 shadow-md flex justify-between items-center">
              <div className="flex items-center gap-2 text-white">
                <BookOpen size={20} />
                <h3 className="font-bold text-lg">المساعد الإسلامي</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                aria-label="إغلاق المساعد"
              >
                <X size={24} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-right ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-bl-none'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-br-none shadow-sm'
                    }`}
                    dir="rtl"
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <span className={`text-[10px] block mt-1 ${
                      msg.role === 'user' ? 'text-emerald-100' : 'text-gray-400'
                    }`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-br-none shadow-sm flex items-center gap-2 text-gray-500" dir="rtl">
                    <Loader2 size={16} className="animate-spin text-emerald-600" />
                    <span className="text-sm">جاري تحليل المصادر...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100">
               <div className="mb-2 text-xs text-gray-400 text-center" dir="rtl">
                 للحصول على أدق النتائج، يرجى تحديد السورة ورقم الآية.
              </div>
              <div className="flex gap-2" dir="rtl">
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                    isLoading || !input.trim()
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg'
                  }`}
                  aria-label="إرسال الرسالة"
                >
                  <Send size={20} />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="اسأل عن آية أو حكم فقهي..."
                  className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-right"
                  dir="rtl"
                  disabled={isLoading}
                />
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
