import React, { useState, useEffect, useCallback } from 'react';
import { Send, X, BookOpen, Sparkles, Trash2, Copy, Mic, MicOff, Volume2, VolumeX, Check, Star, Bookmark, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAiChatbot } from './useAiChatbot';
import { showSuccessToast } from '../../utils/toastUtils';
import { showErrorMessage } from '../../utils/sweetalertUtils';

// ═══════════════════════════════════════════════════════════════════════════
// 📖 FormattedMessage - عرض التفسير بشكل جميل
// يدعم الـ format الجديد من Backend
// ═══════════════════════════════════════════════════════════════════════════

const FormattedMessage = ({ content }: { content: string }) => {
  // 1️⃣ Format جديد: 📖 **سورة X - الآية Y** + 📜 **نص الآية:** + 📚 **تفسير ابن كثير:**
  const newFormatRegex = /📖\s*\*\*(.+?)\*\*[\s\S]*?📜\s*\*\*نص الآية:\*\*\s*([\s\S]*?)📚\s*\*\*تفسير ابن كثير:\*\*\s*([\s\S]*?)(?=📌|$)/;
  const newMatch = content.match(newFormatRegex);
  
  if (newMatch) {
    const [_, header, ayahText, tafsir] = newMatch;
    
    // تحقق من سبب النزول
    const nuzulMatch = content.match(/📌\s*\*\*سبب النزول:\*\*\s*([\s\S]*?)$/);
    const nuzulText = nuzulMatch ? nuzulMatch[1].trim() : null;
    
    return (
      <div className="space-y-4 relative z-10 w-full">
        {/* Header - اسم السورة والآية */}
        <div className="flex justify-center mb-4">
          <div className="bg-emerald-50/80 backdrop-blur-sm border border-emerald-100 px-4 py-2 rounded-full shadow-sm">
            <span className="text-emerald-700 font-bold text-sm text-center block">
              📖 {header.trim()}
            </span>
          </div>
        </div>

        {/* نص الآية القرآنية */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100/50 shadow-inner relative group text-center my-2">
          <div className="absolute top-2 right-2 opacity-50">
            <BookOpen size={16} className="text-emerald-400" />
          </div>
          <p className="font-serif text-xl sm:text-2xl leading-[2] text-gray-800 font-medium py-2 px-2" dir="rtl">
            ﴿ {ayahText.trim()} ﴾
          </p>
        </div>

        {/* تفسير ابن كثير */}
        <div className="bg-white/60 p-4 rounded-lg border-r-4 border-amber-400 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs uppercase font-bold text-amber-600 tracking-wider">📚 تفسير ابن كثير</span>
          </div>
          <p className="text-gray-700 text-sm leading-8 text-justify whitespace-pre-wrap">
            {tafsir.trim()}
          </p>
        </div>

        {/* سبب النزول (إذا وُجد) */}
        {nuzulText && (
          <div className="bg-blue-50/60 p-3 rounded-lg border-r-4 border-blue-400 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase font-bold text-blue-600 tracking-wider">📌 سبب النزول</span>
            </div>
            <p className="text-gray-700 text-sm leading-7 text-justify">
              {nuzulText}
            </p>
          </div>
        )}
      </div>
    );
  }

  // 2️⃣ Format قديم: 🌿 و 🔸 (للتوافق مع الردود القديمة)
  const hasOldMarkers = content.includes('🌿') && content.includes('🔸');
  if (hasOldMarkers) {
    const blockRegex = /🌿(.*?)🌿[\s\S]*?﴿([\s\S]*?)﴾[\s\S]*?🔸.*?:([\s\S]*?)(?=━━━━━━━━|$)/g;
    const blocks = [...content.matchAll(blockRegex)];
    
    if (blocks.length > 0) {
      return (
        <div className="space-y-8 relative z-10 w-full">
          {blocks.map((match, index) => {
            const [_, header, quran, tafsir] = match;
            return (
              <div key={index} className="space-y-3 relative">
                <div className="flex justify-center mb-4">
                  <div className="bg-emerald-50/80 backdrop-blur-sm border border-emerald-100 px-4 py-1.5 rounded-full shadow-sm">
                    <span className="text-emerald-700 font-bold text-xs sm:text-sm text-center block">
                      {header.trim()}
                    </span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100/50 shadow-inner relative group text-center my-2">
                  <p className="font-serif text-xl sm:text-2xl leading-[2] text-gray-800 font-medium py-2 px-2" dir="rtl">
                    ﴿ {quran.trim()} ﴾
                  </p>
                </div>
                <div className="bg-white/60 p-3 rounded-lg border-r-4 border-amber-400 shadow-sm">
                  <p className="text-gray-700 text-sm leading-7 text-justify pl-2">
                    {tafsir.trim()}
                  </p>
                </div>
                {index < blocks.length - 1 && (
                  <div className="border-b border-gray-200/50 w-1/2 mx-auto pt-4" />
                )}
              </div>
            );
          })}
        </div>
      );
    }
  }

  // 3️⃣ Fallback: عرض النص العادي مع Markdown بسيط
  // تحويل **text** إلى bold
  const formattedContent = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  return (
    <p 
      className="text-sm leading-relaxed whitespace-pre-wrap relative z-10"
      dangerouslySetInnerHTML={{ __html: formattedContent }}
    />
  );
};

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
    handleStopGeneration,
    handleAddFavorite,
    handleRemoveFavorite,
    isFavorited,
    favoritesList,
    smartSuggestions,
  } = useAiChatbot();

  // Resize logic
  const [sidebarWidth, setSidebarWidth] = useState(440);
  const [showFavoritesList, setShowFavoritesList] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 320 && newWidth < 1200) {
          setSidebarWidth(newWidth);
        }
      }
    },
    [isResizing]
  );

  useEffect(() => {
    const handleWindowResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleWindowResize);
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

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
  const onToggleFavorite = async (_messageId: string, question: string, answer: string) => {
    const isFav = isFavorited(question);
    
    if (isFav) {
      const result = await handleRemoveFavorite(question);
      if (result.success) {
        showSuccessToast(result.message);
      } else {
        showErrorMessage('خطأ', result.message);
      }
    } else {
      const result = await handleAddFavorite(question, answer);
      if (result.success) {
        showSuccessToast(result.message);
      } else {
        showErrorMessage('خطأ', result.message);
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
        className={`fixed bottom-6 right-6 z-50 group transition-all duration-300 hidden sm:flex ${
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
              className="fixed top-0 right-0 h-full w-full bg-white shadow-2xl z-[100] flex flex-col"
              style={{
                width: isMobile ? '100%' : sidebarWidth,
                boxShadow: '-10px 0 50px rgba(0, 0, 0, 0.1)',
              }}
              dir="rtl"
            >
              {/* Resize Handle */}
              {!isMobile && (
                <div
                  className="absolute left-0 top-0 w-1.5 h-full z-50 cursor-ew-resize hover:bg-emerald-500/20 transition-all active:bg-emerald-500/40"
                  onMouseDown={startResizing}
                  title="سحب لتكبير/تصغير النافذة"
                />
              )}
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
                    {/* زر المفضلة - عرض القائمة */}
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowFavoritesList(!showFavoritesList)}
                      className={`p-2.5 rounded-xl transition-all z-10 backdrop-blur-sm border border-white/20 shadow-lg ${
                        showFavoritesList ? 'bg-white text-emerald-600' : 'text-white hover:bg-white/20'
                      }`}
                      title={showFavoritesList ? 'العودة للمحادثة' : 'عرض المفضلة'}
                    >
                      {showFavoritesList ? <ArrowLeft size={20} strokeWidth={2.5} /> : <Bookmark size={20} strokeWidth={2.5} />}
                    </motion.button>

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
              <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-50/50">
                {/* خلفية خفيفة ثابتة */}
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
                  backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(20, 184, 166, 0.1) 0%, transparent 50%)',
                }}></div>
                
                <div className="absolute inset-0 overflow-y-auto scrollbar-hide p-5 space-y-4">
                  {showFavoritesList ? (
                    <div className="space-y-4 pb-10" dir="rtl">
                       <h3 className="text-emerald-800 font-bold mb-6 text-center text-xl flex items-center justify-center gap-2">
                         <Star size={24} className="text-yellow-400 fill-current" />
                         المفضلة ({favoritesList?.length || 0})
                       </h3>
                       {(!favoritesList || favoritesList.length === 0) ? (
                           <div className="text-center text-gray-500 mt-20 flex flex-col items-center gap-4">
                             <Bookmark size={48} className="text-gray-200" />
                             <p>لا يوجد عناصر في المفضلة</p>
                           </div>
                       ) : (
                           <div className="grid gap-4">
                               {favoritesList.map((fav: any) => (
                                   <div key={fav._id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative group">
                                       <div className="flex justify-between items-start mb-3">
                                            <h4 className="font-bold text-gray-800 text-lg flex-1 ml-4">{fav.question}</h4>
                                            <button 
                                              onClick={() => handleRemoveFavorite(fav.question)}
                                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                              title="إزالة من المفضلة"
                                            >
                                              <Trash2 size={18} />
                                            </button>
                                       </div>
                                       <div className="max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                           <div className="text-sm text-gray-600 leading-relaxed scale-90 origin-top-right">
                                              <FormattedMessage content={fav.answer} />
                                           </div>
                                       </div>
                                       <div className="mt-3 pt-2 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400">
                                          <span>{new Date(fav.createdAt || Date.now()).toLocaleDateString('ar-EG', { timeZone: 'Asia/Jerusalem' })}</span>
                                          <button 
                                            onClick={() => {
                                                setInput(fav.question);
                                                setShowFavoritesList(false);
                                            }}
                                            className="text-emerald-600 font-medium hover:underline flex items-center gap-1"
                                          >
                                            اسأل مجدداً
                                            <ArrowLeft size={12} />
                                          </button>
                                       </div>
                                   </div>
                               ))}
                           </div>
                       )}
                    </div>
                  ) : (
                <AnimatePresence mode="popLayout">
                  {messages.map((msg, index) => {
                    // Check if we need a separator (if current is user and previous was assistant)
                    const showSeparator = index > 0 && msg.role === 'user' && messages[index-1].role === 'assistant';

                    return (
                      <div key={msg.id}>
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
                        
                        <FormattedMessage content={msg.content} />
                        
                        {/* أزرار الإجراءات للرسائل من AI */}
                        {msg.role === 'assistant' && (() => {
                          // حساب البيانات مرة واحدة فقط لتحسين الأداء
                          const msgIndex = messages.findIndex(m => m.id === msg.id);
                          const userMsg = msgIndex > 0 ? messages[msgIndex - 1] : null;
                          const isCurrentlyFavorited = userMsg && isFavorited(userMsg.content);
                          
                          return (
                          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
                            {/* زر المفضلة - إخفاء للرسالة الترحيبية */}
                            {msg.id !== '1' && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  if (userMsg && userMsg.role === 'user') {
                                    onToggleFavorite(msg.id, userMsg.content, msg.content);
                                  }
                                }}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isCurrentlyFavorited
                                    ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                                    : 'hover:bg-gray-100 text-gray-600 hover:text-yellow-600'
                                }`}
                                title={isCurrentlyFavorited ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                              >
                                <Star 
                                  size={14} 
                                  fill={isCurrentlyFavorited ? 'currentColor' : 'none'} 
                                />
                              </motion.button>
                            )}

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
                          );
                        })()}
                        
                        <motion.span 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className={`text-[10px] block mt-2.5 font-medium ${
                            msg.role === 'user' ? 'text-emerald-100' : 'text-gray-400'
                          }`}
                        >
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jerusalem' })}
                        </motion.span>
                      </motion.div>
                    </motion.div>
                    </div>
                  );
                  })}
                
                {/* Enhanced Loading State - عصري */}
                {!showFavoritesList && isLoading && (
                  <motion.div 
                    key="chat-loader"
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
              </AnimatePresence>
              )}
                </div>
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
                      {smartSuggestions.map((suggestion, index) => (
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
                  
                    {isLoading ? (
                      <motion.button
                        type="button"
                        onClick={handleStopGeneration}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-4 rounded-2xl flex items-center justify-center transition-all duration-300 min-w-[60px] bg-red-100 text-red-600 hover:bg-red-200 shadow-lg"
                        title="إلغاء الطلب"
                      >
                         <div className="w-5 h-5 rounded-sm bg-current relative">
                            <div className="absolute inset-0 bg-current opacity-20 animate-ping rounded-sm"></div>
                         </div>
                      </motion.button>
                    ) : (
                    <motion.button
                      type="submit"
                      disabled={!input.trim() || isListening}
                      whileHover={input.trim() && !isListening ? { scale: 1.05, rotate: -5 } : {}}
                      whileTap={input.trim() && !isListening ? { scale: 0.95 } : {}}
                      className={`p-4 rounded-2xl flex items-center justify-center transition-all duration-300 relative overflow-hidden min-w-[60px] ${
                        !input.trim() || isListening
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 text-white hover:shadow-2xl shadow-lg'
                      }`}
                      style={
                        input.trim() && !isListening
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
                      
                      <div className="relative z-10">
                         <Send size={24} className={input.trim() && !isListening ? "-mr-1" : ""} />
                      </div>
                    </motion.button>
                     )}
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