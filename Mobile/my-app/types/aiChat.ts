/**
 * AI Chat Types - Mobile App
 * أنواع الدردشة مع الذكاء الاصطناعي للتطبيق المحمول
 */

export interface AiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface AiChatState {
  messages: AiMessage[];
  isLoading: boolean;
  input: string;
}

export interface AiChatResponse {
  success: boolean;
  data: {
    message: string;
  };
  message?: string;
}
