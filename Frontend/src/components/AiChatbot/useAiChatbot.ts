import { useState, useRef, useEffect } from 'react';
import { sendAiChatMessage, addFavorite, getFavorites, deleteFavorite, generateSpeech, transcribeAudio, getSmartSuggestion } from '../../Api/aiChatApi';
import { validateData, chatMessageSchema, addFavoriteSchema } from '../../Validation/aiChatValidation';

// Types for chat messages
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ✅ نوع الاقتراح الجديد (سورة + chatText)
export interface SurahSuggestion {
  type: 'memorization' | 'review';
  surahName: string;
  surahNumber: number;
  label: string;
  chatText: string; // النص الذي يُنقل للـ input
}

// ✅ نوع اقتراحات "هل تقصد؟"
export interface DidYouMeanSuggestion {
  surahName: string;
  surahNumber: number;
  label: string;
  chatText: string;
}


export const useAiChatbot = () => {
  // بدون رسالة ترحيب - نبدأ بقائمة فارغة
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false); // ✅ حالة تحميل الصوت
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritesList, setFavoritesList] = useState<any[]>([]);
  const [smartSuggestions, setSmartSuggestions] = useState<SurahSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  // ✅ اقتراحات "هل تقصد؟" عند الخطأ الإملائي
  const [didYouMeanSuggestions, setDidYouMeanSuggestions] = useState<DidYouMeanSuggestion[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Get user role
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

  // تحديث الاقتراحات - جلب حسب الطالب
  const loadSmartSuggestions = async () => {
    try {
      // فقط للطلاب نقوم بجلب الاقتراح
      if (userRole === 'student' || userRole === 'Student' || userRole === 'طالب') {
        const data = await getSmartSuggestion();
        if (data && data.success) {
          // ✅ Format جديد: Array من objects
          if (data.suggestions && Array.isArray(data.suggestions)) {
            // تحقق إذا كانت objects أو strings (للتوافق مع القديم)
            const suggestions: SurahSuggestion[] = data.suggestions.map((s: any) => {
              if (typeof s === 'string') {
                // Format قديم (string) - تحويل
                return {
                  type: 'memorization' as const,
                  surahName: s,
                  surahNumber: 0,
                  label: s,
                  chatText: s
                };
              }
              // Format جديد (object)
              return s as SurahSuggestion;
            });
            setSmartSuggestions(suggestions);
            setShowSuggestions(suggestions.length > 0);
          } else {
            setSmartSuggestions([]);
            setShowSuggestions(false);
          }
        } else {
          setSmartSuggestions([]);
          setShowSuggestions(false);
        }
      } else {
        setSmartSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Failed to load suggestions", error);
      setSmartSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Load favorites on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  // Load suggestions when chat opens
  useEffect(() => {
    if (isOpen) {
      loadSmartSuggestions();
    }
  }, [isOpen]);

  // Cleanup audio on unmount

  // Auto scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle stop generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Validate message
    const validation = await validateData(chatMessageSchema, { message: input.trim() });
    if (!validation.isValid) {
      console.error('Validation errors:', validation.errors);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false); // إخفاء الاقتراحات عند بدء المحادثة

  // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      const data = await sendAiChatMessage(userMessage.content, abortControllerRef.current.signal);

      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // ✅ معالجة اقتراحات "هل تقصد؟" عند الخطأ الإملائي
        if (data.data.surahSuggestions && data.data.surahSuggestions.length > 0) {
          setDidYouMeanSuggestions(data.data.surahSuggestions);
        } else {
          setDidYouMeanSuggestions([]);
        }
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      // Check if cancelled
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED' || error.message === 'canceled') {
         console.log('Request canceled by user');
         return; // Don't show error message
      }

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
      abortControllerRef.current = null;
    }
  };

  // Load favorites on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const data = await getFavorites();
      if (data.success) {
        // Store message IDs that are favorited
        const favIds = data.data.map((fav: any) => fav.question);
        setFavorites(favIds);
        setFavoritesList(data.data);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  // Add to favorites
  const handleAddFavorite = async (question: string, answer: string) => {
    try {
      // Validate data
      const validation = await validateData(addFavoriteSchema, { question, answer });
      if (!validation.isValid) {
        return { success: false, message: Object.values(validation.errors || {})[0] };
      }

      const data = await addFavorite({ question, answer });

      if (data.success) {
        setFavorites(prev => [...prev, question]);
        if (data.data) {
          setFavoritesList(prev => [data.data, ...prev]);
        }
        return { success: true, message: 'تم إضافة الرسالة إلى المفضلة' };
      }
      return { success: false, message: data.message };
    } catch (error: any) {
      console.error('Error adding favorite:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'حدث خطأ أثناء إضافة المفضلة' 
      };
    }
  };

  // Remove from favorites
  const handleRemoveFavorite = async (question: string) => {
    try {
      // Find the favorite by question
      const data = await getFavorites({ search: question, limit: 1 });

      if (data.success && data.data.length > 0) {
        const favoriteId = data.data[0]._id;
        const deleteData = await deleteFavorite(favoriteId);
        
        if (deleteData.success) {
          setFavorites(prev => prev.filter(q => q !== question));
          setFavoritesList(prev => prev.filter(f => f.question !== question));
          return { success: true, message: 'تم إزالة الرسالة من المفضلة' };
        }
      }
      return { success: false, message: 'لم يتم العثور على المفضلة' };
    } catch (error: any) {
      console.error('Error removing favorite:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'حدث خطأ أثناء إزالة المفضلة' 
      };
    }
  };

  // Check if message is favorited
  const isFavorited = (question: string) => {
    return favorites.includes(question);
  };

  // Clear chat history
  const handleClearChat = () => {
    setMessages([]);
  };

  // Copy message to clipboard
  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      return true;
    } catch (error) {
      console.error('Copy failed:', error);
      return false;
    }
  };

  // Handle quick suggestion click
  // ✅ يستقبل SurahSuggestion ويضع chatText في الـ input
  const handleQuickSuggestion = (suggestion: SurahSuggestion) => {
    // ينقل النص للـ input - الطالب يُكمل برقم الآية
    setInput(suggestion.chatText);
  };

  // ✅ معالجة اختيار "هل تقصد؟"
  const handleDidYouMeanSuggestion = (suggestion: DidYouMeanSuggestion) => {
    // ينقل النص للـ input - الطالب يُكمل برقم الآية
    setInput(suggestion.chatText);
    // إخفاء الاقتراحات بعد الاختيار
    setDidYouMeanSuggestions([]);
  };

  // ✅ رفض اقتراحات "هل تقصد؟"
  const handleDismissDidYouMean = () => {
    setDidYouMeanSuggestions([]);
  };

  // Text-to-Speech (OpenAI TTS via Backend)
  const handleSpeak = async (text: string) => {
    // Stop any ongoing speech
    handleStopSpeaking();

    // ═══════════════════════════════════════════════════════════════════════
    // 🔊 Smart TTS - يقرأ التفسير فقط بذكاء
    // ═══════════════════════════════════════════════════════════════════════
    
    let textToSpeak = '';
    
    // 1️⃣ Format جديد: 📚 **تفسير ابن كثير:**
    const newTafsirMarker = /📚\s*\*\*تفسير ابن كثير:\*\*\s*/;
    if (newTafsirMarker.test(text)) {
      const parts = text.split(newTafsirMarker);
      if (parts.length > 1) {
        // نأخذ التفسير وننظفه من أي markers إضافية
        textToSpeak = parts[1]
          .replace(/📌\s*\*\*سبب النزول:\*\*[\s\S]*/g, '') // إزالة سبب النزول
          .replace(/\*\*/g, '') // إزالة Markdown bold
          .replace(/━+/g, '') // إزالة الفواصل
          .trim();
      }
    }
    
    // 2️⃣ Format قديم: 🔸 التفسير:
    else if (text.includes('🔸') && text.includes('﴿')) {
      const tafsirMatch = text.match(/🔸.*?:\s*([\s\S]*?)(?=━━━|$)/);
      if (tafsirMatch) {
        textToSpeak = tafsirMatch[1].trim();
      }
    }
    
    // 3️⃣ Format: 📜 التفسير (ابن كثير – مختصر):
    else if (text.includes('📜 التفسير')) {
      const parts = text.split(/📜\s*التفسير.*?:/);
      if (parts.length > 1) {
        textToSpeak = parts[1]
          .replace(/📌[\s\S]*/g, '')
          .trim();
      }
    }
    
    // 4️⃣ Fallback: إذا لم نجد أي format، نقرأ النص كاملاً
    // لكن ننظفه من الرموز والـ Markdown
    if (!textToSpeak) {
      textToSpeak = text
        .replace(/📖|📜|📚|📌|🌿|🔸|🔹|━+|﴿|﴾|\*\*/g, '')
        .replace(/--+/g, '')
        .trim();
    }
    
    // لا نقرأ الرسائل الفارغة أو القصيرة جداً
    if (!textToSpeak || textToSpeak.length < 10) {
      console.log('TTS: No valid text to speak');
      return;
    }
    
    // تقصير النص الطويل جداً (OpenAI TTS limit)
    if (textToSpeak.length > 4000) {
      textToSpeak = textToSpeak.substring(0, 4000) + '...';
    }

    console.log('🔊 TTS will speak:', textToSpeak.substring(0, 100) + '...');
    console.log('🔊 TTS text length:', textToSpeak.length, 'chars');
    // ═══════════════════════════════════════════════════════════════════════

    try {
      setIsLoadingAudio(true); // ✅ بداية تحميل الصوت
      setIsSpeaking(false);
      
      const audioBlob = await generateSpeech(textToSpeak);
      
      // ✅ التحقق من حجم الـ blob
      if (!audioBlob || audioBlob.size === 0) {
        console.error('TTS: Empty audio blob received');
        setIsLoadingAudio(false);
        setIsSpeaking(false);
        return;
      }
      
      console.log('🔊 TTS audio blob size:', audioBlob.size, 'bytes');
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audioRef.current = audio;
      
      audio.oncanplaythrough = () => {
        setIsLoadingAudio(false); // ✅ انتهى التحميل
        setIsSpeaking(true);
        audio.play().catch(e => {
          console.error('Audio play error:', e);
          setIsSpeaking(false);
        });
      };
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = (e) => {
        console.error('Audio Playback Error:', e);
        setIsLoadingAudio(false);
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

    } catch (error: any) {
      console.error('TTS Generation Error:', error);
      // ✅ عرض رسالة خطأ واضحة
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.error('TTS: Request timeout - text may be too long');
      }
      setIsLoadingAudio(false);
      setIsSpeaking(false);
    }
  };

  // Stop speaking
  const handleStopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsSpeaking(false);
    }
  };

  // Voice input using OpenAI Whisper
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const handleStartListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      chunksRef.current = []; // Reset chunks

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());

        try {
          setIsLoading(true); // Show loading while transcribing
          const data = await transcribeAudio(audioBlob);
          if (data.success && data.text) {
             setInput(data.text);
             // Optionally auto-submit: 
             // handleSubmit(null, data.text); 
          }
        } catch (error) {
          console.error("Transcription failed", error);
        } finally {
          setIsLoading(false);
        }
      };

      mediaRecorderRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  return {
    // State
    isOpen,
    messages,
    input,
    isLoading,
    isListening,
    isSpeaking,
    isLoadingAudio, // ✅ حالة تحميل الصوت
    messagesEndRef,
    userRole,
    favoritesList,
    
    // Actions
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
    smartSuggestions,
    showSuggestions,
    // ✅ اقتراحات "هل تقصد؟"
    didYouMeanSuggestions,
    handleDidYouMeanSuggestion,
    handleDismissDidYouMean
  };
};
