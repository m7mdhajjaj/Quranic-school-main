import { useState, useRef, useEffect } from 'react';
import { sendAiChatMessage, addFavorite, getFavorites, deleteFavorite, generateSpeech } from '../../Api/aiChatApi';
import { validateData, chatMessageSchema, addFavoriteSchema } from '../../Validation/aiChatValidation';

// Types for chat messages
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useAiChatbot = () => {
  const initialMessage: Message = {
    id: '1',
    role: 'assistant',
    content: 'السلام عليكم! أنا مساعدك لتفسير القرآن الكريم. \n\n💡 يمكنك السؤال بأي طريقة:\n• تفسير سورة الإخلاص\n• سورة البقرة آية 255\n• الآية الأولى من سورة طه\n• ما تفسير آية الكرسي\n• اشرح لي سورة الفاتحة',
    timestamp: new Date()
  };

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Initialize speech recognition (Browser Built-in)
  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = 'ar-SA'; // Arabic Saudi
        recognitionRef.current.continuous = false; // Stop after one phrase
        recognitionRef.current.interimResults = true; // Show interim results
        recognitionRef.current.maxAlternatives = 3; // Get multiple alternatives

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          // Use final transcript if available, otherwise show interim
          if (finalTranscript) {
            setInput(finalTranscript.trim());
            setIsListening(false);
          } else if (interimTranscript) {
            setInput(interimTranscript.trim());
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Auto scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    try {
      const data = await sendAiChatMessage(userMessage.content);

      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.message);
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
    setMessages([initialMessage]);
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
  const handleQuickSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  // Text-to-Speech (OpenAI TTS via Backend)
  const handleSpeak = async (text: string) => {
    // Stop any ongoing speech
    handleStopSpeaking();

    // ---------------------------------------------------------
    // RULE: Only speak the Explanation (Tafsir), NOT the Verse.
    // ---------------------------------------------------------
    let textToSpeak = text;
    // Marker matching the Backend output exactly
    const tafsirMarker = "📜 التفسير (ابن كثير – مختصر):";
    
    if (text.includes(tafsirMarker)) {
      const parts = text.split(tafsirMarker);
      if (parts.length > 1) {
        textToSpeak = parts[1].trim(); 
      }
    }
    // ---------------------------------------------------------
    
    if (!textToSpeak) return;

    try {
      setIsSpeaking(true);
      const audioBlob = await generateSpeech(textToSpeak);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = (e) => {
        console.error('Audio Playback Error:', e);
        setIsSpeaking(false);
      };

      await audio.play();
    } catch (error) {
      console.error('TTS Generation Error:', error);
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

  // Voice input
  const handleStartListening = () => {
    if (!recognitionRef.current) return;

    try {
      setIsListening(true);
      recognitionRef.current.start();
    } catch (error) {
      console.error('Speech recognition error:', error);
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
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
    messagesEndRef,
    userRole,
    
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
    handleAddFavorite,
    handleRemoveFavorite,
    isFavorited,
  };
};
