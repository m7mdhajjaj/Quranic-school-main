import React, { useState } from 'react';
import { Send, X, Loader2, BookOpen, Sparkles, Trash2, Copy, Mic, MicOff, Volume2, VolumeX, Check, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAiChatbot } from './useAiChatbot';
import { showSuccessToast } from '../../utils/toastUtils';
import { showErrorMessage } from '../../utils/sweetalertUtils';

// Quick suggestions for common questions
const QUICK_SUGGESTIONS = [
  'تفسير سورة الفاتحة',
  'ما هي آية الكرسي؟',
  'تفسير سورة الإخلاص',
  'أحكام الوضوء',
];

export const AiChatbot: React.FC = () => {
  const {
    isOpen,
    messages,
    input,
    isLoading,
    isListening,
    isSpeaking,
    messagesEndRef,
    userRole,
    setIsOpen,
    setInput,
    handleSubmit,
    handleClearChat,
    handleCopyMessage,
    handleQuickSuggestion,
    handleSpeak,
    handleStopSpeaking,
    handleStartListening,
    handleStopListening,
    handleAddFavorite,
    handleRemoveFavorite,
    isFavorited,
  } = useAiChatbot();

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Handle copy with feedback
  const onCopyMessage = async (messageId: string, content: string) => {
    const success = await handleCopyMessage(content);
    if (success) {
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Handle favorite toggle
  const onToggleFavorite = async (messageId: string, question: string, answer: string) => {
    const isFav = isFavorited(question);
    
    if (isFav) {
      const result = await handleRemoveFavorite(question);
      if (result.success) {
        showSuccessToast(result.message);
      } else {
        showErrorMessage(result.message);
      }
    } else {
      const result = await handleAddFavorite(question, answer);
      if (result.success) {
        showSuccessToast(result.message);
      } else {
        showErrorMessage(result.message);
      }
    }
  };

  // إخفاء الشات بوت عن الأدمن
  if (userRole === 'admin') {
    return null;
  }

  return (
    <>
      {/* Toggle Button - تصميم عصري AI */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 group transition-all duration-300 ${
          isOpen ? 'translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}
        aria-label="فتح المساعد الذكي"
      >
        {/* الخلفية الرئيسية مع Gradient عصري */}
        <div className="relative">
          {/* الدائرة الرئيسية */}
          <motion.div
            animate={{
              boxShadow: [
                '0 10px 40px rgba(16, 185, 129, 0.4)',
                '0 10px 60px rgba(20, 184, 166, 0.6)',
                '0 10px 40px rgba(16, 185, 129, 0.4)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center relative overflow-hidden"
          >
            {/* تأثير الضوء المتحرك */}
            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
            
            {/* الأيقونة */}
            <motion.div
              animate={{
                y: [0, -2, 0],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative z-10"
            >
              <Sparkles size={26} className="text-white drop-shadow-lg" />
            </motion.div>
          </motion.div>

          {/* نبضة خارجية */}
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500"
          />

          {/* Badge "AI" عصري */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 flex items-center justify-center shadow-lg border-2 border-white"
          >
            <span className="text-[10px] font-black text-white tracking-tight">AI</span>
          </motion.div>

          {/* خطوط دائرية متحركة */}
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-2 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, rgba(16, 185, 129, 0.3) 90deg, transparent 180deg)',
            }}
          />
        </div>

        {/* Tooltip عصري */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          whileHover={{ opacity: 1, scale: 1, y: 0 }}
          className="absolute bottom-full mb-3 right-0 px-4 py-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-sm font-bold rounded-xl shadow-xl whitespace-nowrap border border-gray-700"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-yellow-400" />
            <span>مساعدك الذكي</span>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-8 border-transparent border-t-gray-800"></div>
          </div>
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
              className="fixed top-0 right-0 h-full w-full sm:w-[440px] bg-white shadow-2xl z-[100] flex flex-col"
              style={{
                boxShadow: '-10px 0 50px rgba(0, 0, 0, 0.1)',
              }}
              dir="rtl"
            >
              {/* Header عصري مع Gradient وتأثيرات AI */}
              <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-6 shadow-xl overflow-hidden">
                {/* خلفية متحركة عصرية */}
                <motion.div
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                  }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.1) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.1) 75%)',
                    backgroundSize: '40px 40px',
                  }}
                />

                {/* نقاط مضيئة متحركة */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-4 right-20 w-32 h-32 bg-white/10 rounded-full blur-3xl"
                />
                <motion.div
                  animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.4, 0.7, 0.4],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute bottom-4 left-20 w-40 h-40 bg-purple-400/10 rounded-full blur-3xl"
                />
                
                <div className="relative z-10 flex justify-between items-center">
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4"
                  >
                    {/* أيقونة AI متحركة */}
                    <motion.div
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="relative"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-lg">
                        <Sparkles size={24} className="text-white drop-shadow-lg" />
                      </div>
                      {/* Badge AI صغير */}
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-2 border-white shadow-md">
                        <span className="text-[8px] font-black text-white">AI</span>
                      </div>
                    </motion.div>
                    
                    <div className="text-white">
                      <motion.h3 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-black text-2xl tracking-tight drop-shadow-md"
                      >
                        المساعد الإسلامي
                      </motion.h3>
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-2 mt-1"
                      >
                        <div className="flex items-center gap-1">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-2 h-2 rounded-full bg-green-300 shadow-lg shadow-green-400/50"
                          />
                          <span className="text-xs font-bold text-white/90">متصل</span>
                        </div>
                        <span className="text-xs text-white/60">•</span>
                        <span className="text-xs font-semibold text-white/90">مدعوم بـ AI</span>
                      </motion.div>
                    </div>
                  </motion.div>
                  
                  <div className="flex items-center gap-2">
                    {/* زر حذف المحادثة */}
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleClearChat}
                      className="p-2.5 text-white hover:bg-white/20 rounded-xl transition-all z-10 backdrop-blur-sm border border-white/20 shadow-lg"
                      title="حذف المحادثة"
                    >
                      <Trash2 size={20} strokeWidth={2.5} />
                    </motion.button>

                    {/* زر الإغلاق */}
                    <motion.button 
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsOpen(false)}
                      className="p-2.5 text-white hover:bg-white/20 rounded-xl transition-all z-10 backdrop-blur-sm border border-white/20 shadow-lg"
                      aria-label="إغلاق المساعد"
                    >
                      <X size={22} strokeWidth={2.5} />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Messages Area مع تصميم عصري */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-gray-50 via-white to-gray-50/50 relative">
                {/* خلفية خفيفة */}
                <div className="absolute inset-0 opacity-5" style={{
                  backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(20, 184, 166, 0.1) 0%, transparent 50%)',
                }}></div>
                <AnimatePresence mode="popLayout">
                  {messages.map((msg, index) => {
                    // Check if we need a separator (if current is user and previous was assistant)
                    const showSeparator = index > 0 && msg.role === 'user' && messages[index-1].role === 'assistant';

                    return (
                      <React.Fragment key={msg.id}>
                        {showSeparator && (
                          <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-4 py-4"
                          >
                            <div className="h-px bg-gray-200 flex-1"></div>
                            <span className="text-xs text-gray-400 font-medium px-2 bg-gray-50 rounded-full">سؤال جديد</span>
                            <div className="h-px bg-gray-200 flex-1"></div>
                          </motion.div>
                        )}
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                        delay: index * 0.05
                      }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} relative z-10`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        className={`max-w-[85%] p-4 rounded-2xl text-right shadow-lg relative overflow-hidden ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 text-white rounded-bl-sm border border-emerald-400/20'
                            : 'bg-white border border-gray-100 text-gray-800 rounded-br-sm'
                        }`}
                        dir="rtl"
                      >
                        {/* تأثير لامع للرسائل */}
                        {msg.role === 'user' && (
                          <motion.div
                            animate={{
                              x: ['-100%', '200%'],
                            }}
                            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                            className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                          />
                        )}
                        
                        {msg.role === 'assistant' && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 mb-2.5 pb-2 border-b border-gray-100"
                          >
                            <motion.div
                              animate={{
                                rotate: [0, 360],
                              }}
                              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                              className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md"
                            >
                              <Sparkles size={12} className="text-white" />
                            </motion.div>
                            <div>
                              <span className="text-xs font-bold text-gray-800">المساعد الذكي</span>
                              <motion.div
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="flex items-center gap-1 mt-0.5"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                <span className="text-[10px] text-gray-500">AI مُفعّل</span>
                              </motion.div>
                            </div>
                          </motion.div>
                        )}
                        
                        <p className="text-sm leading-relaxed whitespace-pre-wrap relative z-10">{msg.content}</p>
                        
                        {/* أزرار الإجراءات للرسائل من AI */}
                        {msg.role === 'assistant' && (
                          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
                            {/* زر المفضلة */}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                // Find the previous user message (question)
                                const msgIndex = messages.findIndex(m => m.id === msg.id);
                                const userMsg = msgIndex > 0 ? messages[msgIndex - 1] : null;
                                if (userMsg && userMsg.role === 'user') {
                                  onToggleFavorite(msg.id, userMsg.content, msg.content);
                                }
                              }}
                              className={`p-1.5 rounded-lg transition-colors ${
                                (() => {
                                  const msgIndex = messages.findIndex(m => m.id === msg.id);
                                  const userMsg = msgIndex > 0 ? messages[msgIndex - 1] : null;
                                  return userMsg && isFavorited(userMsg.content)
                                    ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                                    : 'hover:bg-gray-100 text-gray-600 hover:text-yellow-600';
                                })()
                              }`}
                              title={(() => {
                                const msgIndex = messages.findIndex(m => m.id === msg.id);
                                const userMsg = msgIndex > 0 ? messages[msgIndex - 1] : null;
                                return userMsg && isFavorited(userMsg.content) ? 'إزالة من المفضلة' : 'إضافة للمفضلة';
                              })()}
                            >
                              <Star 
                                size={14} 
                                fill={(() => {
                                  const msgIndex = messages.findIndex(m => m.id === msg.id);
                                  const userMsg = msgIndex > 0 ? messages[msgIndex - 1] : null;
                                  return userMsg && isFavorited(userMsg.content) ? 'currentColor' : 'none';
                                })()} 
                              />
                            </motion.button>

                            {/* زر النسخ */}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => onCopyMessage(msg.id, msg.content)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-emerald-600"
                              title="نسخ الرسالة"
                            >
                              {copiedId === msg.id ? (
                                <Check size={14} className="text-green-600" />
                              ) : (
                                <Copy size={14} />
                              )}
                            </motion.button>

                            {/* زر القراءة الصوتية */}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => isSpeaking ? handleStopSpeaking() : handleSpeak(msg.content)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-emerald-600"
                              title={isSpeaking ? "إيقاف القراءة" : "استماع للرسالة"}
                            >
                              {isSpeaking ? (
                                <VolumeX size={14} />
                              ) : (
                                <Volume2 size={14} />
                              )}
                            </motion.button>
                          </div>
                        )}
                        
                        <motion.span 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className={`text-[10px] block mt-2.5 font-medium ${
                            msg.role === 'user' ? 'text-emerald-100' : 'text-gray-400'
                          }`}
                        >
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </motion.span>
                      </motion.div>
                      </motion.div>
                    );
                  })}
                
                {/* Enhanced Loading State - عصري */}
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start relative z-10"
                  >
                    <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-br-sm shadow-lg relative overflow-hidden" dir="rtl">
                      {/* خلفية متحركة */}
                      <motion.div
                        animate={{
                          x: ['-100%', '200%'],
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-emerald-50 to-transparent"
                      />
                      
                      <div className="flex items-center gap-3 relative z-10">
                        {/* Spinner دائري عصري */}
                        <div className="relative">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-8 h-8 rounded-full border-3 border-emerald-200 border-t-emerald-600"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <Sparkles size={14} className="text-emerald-600" />
                          </motion.div>
                        </div>
                        
                        <div className="flex flex-col gap-1.5">
                          <span className="text-sm text-gray-700 font-semibold">AI يفكر...</span>
                          <div className="flex gap-1.5">
                            {[0, 1, 2, 3].map((i) => (
                              <motion.div
                                key={i}
                                animate={{
                                  scale: [1, 1.5, 1],
                                  backgroundColor: ['#d1fae5', '#10b981', '#d1fae5'],
                                }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  delay: i * 0.15,
                                }}
                                className="w-1.5 h-1.5 rounded-full bg-emerald-300"
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

              {/* Enhanced Input Area - عصري */}
              <div className="p-5 bg-gradient-to-b from-white to-gray-50 border-t border-gray-200 shadow-2xl relative">
                {/* خلفية خفيفة */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/30 via-transparent to-teal-50/30"></div>
                
                {/* Quick Suggestions */}
                {messages.length === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 relative z-10"
                    dir="rtl"
                  >
                    <p className="text-xs text-gray-600 font-semibold mb-2 flex items-center gap-2">
                      <Sparkles size={14} className="text-emerald-600" />
                      اقتراحات سريعة:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_SUGGESTIONS.map((suggestion, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleQuickSuggestion(suggestion)}
                          className="px-3 py-1.5 text-xs bg-white hover:bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 font-medium transition-colors shadow-sm"
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 p-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-xl border border-emerald-200 relative z-10 shadow-sm" 
                  dir="rtl"
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <BookOpen size={16} className="text-emerald-600" />
                    </motion.div>
                    <p className="text-xs text-emerald-800 font-semibold">
                      للحصول على أدق النتائج، يرجى تحديد السورة ورقم الآية.
                    </p>
                  </div>
                </motion.div>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-3 relative z-10" dir="rtl">
                  {/* Voice Recording Info */}
                  {isListening && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="w-3 h-3 bg-red-500 rounded-full"
                      />
                      <span className="text-sm font-bold text-red-600">جاري التسجيل... تحدث الآن</span>
                    </motion.div>
                  )}

                  <div className="flex gap-2">
                    {/* Voice Input Button - واضح وكبير */}
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={isListening ? handleStopListening : handleStartListening}
                      className={`p-4 rounded-2xl flex items-center justify-center transition-all duration-300 min-w-[60px] ${
                        isListening
                          ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/50'
                          : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-emerald-500/50'
                      }`}
                      title={isListening ? "إيقاف التسجيل" : "🎤 اضغط للتحدث"}
                    >
                      <motion.div
                        animate={isListening ? { scale: [1, 1.3, 1] } : {}}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                      </motion.div>
                    </motion.button>

                    <motion.input
                      whileFocus={{ scale: 1.01, y: -2 }}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={isListening ? "استمع..." : "اكتب سؤالك أو اضغط 🎤 للتحدث"}
                      className="flex-1 p-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300 transition-all bg-white shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ direction: 'rtl', textAlign: 'right' }}
                      disabled={isLoading || isListening}
                    />
                  
                    <motion.button
                      type="submit"
                      disabled={isLoading || !input.trim() || isListening}
                      whileHover={!isLoading && input.trim() && !isListening ? { scale: 1.05, rotate: -5 } : {}}
                      whileTap={!isLoading && input.trim() && !isListening ? { scale: 0.95 } : {}}
                      className={`p-4 rounded-2xl flex items-center justify-center transition-all duration-300 relative overflow-hidden min-w-[60px] ${
                        isLoading || !input.trim() || isListening
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 text-white hover:shadow-2xl shadow-lg'
                      }`}
                      style={
                        !isLoading && input.trim() && !isListening
                          ? { boxShadow: '0 8px 30px rgba(16, 185, 129, 0.4)' }
                          : {}
                      }
                      aria-label="إرسال الرسالة"
                    >
                      {/* تأثير لامع للزر */}
                      {!isLoading && input.trim() && !isListening && (
                        <motion.div
                          animate={{
                            x: ['-100%', '200%'],
                          }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                          className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                        />
                      )}
                      
                      <motion.div
                        animate={isLoading ? { rotate: 360 } : { x: [0, -3, 0] }}
                        transition={isLoading ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 1.5, repeat: Infinity }}
                        className="relative z-10"
                      >
                        {isLoading ? (
                          <Loader2 size={24} />
                        ) : (
                          <Send size={24} />
                        )}
                      </motion.div>
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AiChatbot;