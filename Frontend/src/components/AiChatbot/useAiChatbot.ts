import { useState, useRef, useEffect } from 'react';
import { sendAiChatMessage, addFavorite, getFavorites, deleteFavorite, generateSpeech, transcribeAudio } from '../../Api/aiChatApi';
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
  const [favoritesList, setFavoritesList] = useState<any[]>([]);
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

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
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
  };
};
