import { useState, useRef, useEffect } from 'react';
import api from '../../Api/api';

// Types for chat messages
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useAiChatbot = () => {
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

  return {
    // State
    isOpen,
    messages,
    input,
    isLoading,
    messagesEndRef,
    userRole,
    
    // Actions
    setIsOpen,
    setInput,
    handleSubmit,
  };
};
