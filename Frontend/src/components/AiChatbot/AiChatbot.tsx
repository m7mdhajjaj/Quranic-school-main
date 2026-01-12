import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageSquare, ChevronLeft, ChevronRight, Loader2, BookOpen, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
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
      content: 'السلام عليكم! أنا مساعدك لتفسير القرآن الكريم. \n\n💡 يمكنك السؤال بأي طريقة:\n• تفسير سورة الإخلاص\n• سورة البقرة آية 255\n• الآية الأولى من سورة طه\n• ما تفسير آية الكرسي\n• اشرح لي سورة الفاتحة',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // الحصول على دور المستخدم
  const getUserRole = (): string | null => {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        return userData.role;
      }
      return null;
    } catch {
      return null;
    }
  };

  const userRole = getUserRole();

  // إخفاء الشات بوت عن الأدمن
  if (userRole === 'admin') {
    return null;
  }

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
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 z-50 p-5 rounded-full shadow-2xl transition-all duration-300 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white ${
          isOpen ? 'translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}
        style={{
          boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4)'
        }}
        aria-label="Toggle AI Chat"
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <BookOpen size={28} />
        </motion.div>
      </motion.button>

      {/* Chat Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[99] sm:hidden"
            />
            
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 250 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-gradient-to-b from-white to-gray-50 shadow-2xl z-[100] border-l border-gray-200 flex flex-col"
              dir="rtl"
            >
              {/* Header with Gradient */}
              <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-5 shadow-lg flex justify-between items-center relative overflow-hidden">
                {/* Animated background pattern */}
                <motion.div
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                  }}
                />
                
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 text-white z-10"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Sparkles size={24} className="text-yellow-300" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-xl">المساعد الإسلامي</h3>
                    <p className="text-xs text-emerald-100">مدعوم بالذكاء الاصطناعي</p>
                  </div>
                </motion.div>
                
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-white hover:bg-white/20 rounded-full transition-colors z-10 backdrop-blur-sm"
                  aria-label="إغلاق المساعد"
                >
                  <X size={24} />
                </motion.button>
              </div>

              {/* Messages Area with Enhanced Styling */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                <AnimatePresence mode="popLayout">
                  {messages.map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                        delay: index * 0.05
                      }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`max-w-[85%] p-4 rounded-2xl text-right shadow-md ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-bl-none'
                            : 'bg-white border border-gray-100 text-gray-800 rounded-br-none'
                        }`}
                        dir="rtl"
                      >
                        {msg.role === 'assistant' && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2 mb-2 text-emerald-600"
                          >
                            <Sparkles size={14} />
                            <span className="text-xs font-semibold">الذكاء الاصطناعي</span>
                          </motion.div>
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <motion.span 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className={`text-[10px] block mt-2 ${
                            msg.role === 'user' ? 'text-emerald-100' : 'text-gray-400'
                          }`}
                        >
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </motion.span>
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {/* Enhanced Loading State */}
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-br-none shadow-md" dir="rtl">
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Loader2 size={18} className="text-emerald-600" />
                        </motion.div>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-gray-600 font-medium">جاري تحليل المصادر</span>
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                animate={{
                                  scale: [1, 1.2, 1],
                                  opacity: [0.5, 1, 0.5]
                                }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  delay: i * 0.2
                                }}
                                className="w-2 h-2 bg-emerald-500 rounded-full"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Enhanced Input Area */}
              <div className="p-5 bg-white border-t border-gray-100 shadow-lg">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100" 
                  dir="rtl"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-emerald-600" />
                    <p className="text-xs text-emerald-700 font-medium">
                      للحصول على أدق النتائج، يرجى تحديد السورة ورقم الآية.
                    </p>
                  </div>
                </motion.div>
                
                <form onSubmit={handleSubmit} className="flex gap-3" dir="rtl">
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="اسأل عن آية أو حكم فقهي..."
                    className="flex-1 p-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                    style={{ direction: 'rtl', textAlign: 'right' }}
                    disabled={isLoading}
                  />
                  
                  <motion.button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    whileHover={!isLoading && input.trim() ? { scale: 1.05, rotate: -5 } : {}}
                    whileTap={!isLoading && input.trim() ? { scale: 0.95 } : {}}
                    className={`p-3.5 rounded-xl flex items-center justify-center transition-all duration-200 ${
                      isLoading || !input.trim()
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:shadow-xl'
                    }`}
                    style={
                      !isLoading && input.trim() 
                        ? { boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)' }
                        : {}
                    }
                    aria-label="إرسال الرسالة"
                  >
                    <motion.div
                      animate={isLoading ? {} : { x: [0, -3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Send size={20} />
                    </motion.div>
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
