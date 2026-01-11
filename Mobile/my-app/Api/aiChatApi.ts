import api from "./api";

// ============================================================================
// AI Chat API - Islamic Assistant
// ============================================================================

export interface AiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date | string;
}

export interface AiChatRequest {
  message: string;
}

export interface AiChatResponse {
  success: boolean;
  data: {
    message: string;
    timestamp: string;
  };
  message?: string;
}

/**
 * Send a message to the AI Islamic Assistant
 * @param message - The user's question or request
 * @returns Promise with AI response
 */
export const sendAiMessage = async (
  message: string
): Promise<AiChatResponse> => {
  const response = await api.post<AiChatResponse>("/ai-chat", { message });
  return response.data;
};

/**
 * Get Quran tafsir (interpretation) using AI
 * @param surahNumber - The surah number (1-114)
 * @param ayahNumber - The ayah number (optional)
 * @returns Promise with tafsir response
 */
export const getQuranTafsir = async (
  surahNumber: number,
  ayahNumber?: number
): Promise<AiChatResponse> => {
  const message = ayahNumber
    ? `تفسير سورة ${surahNumber} آية ${ayahNumber}`
    : `تفسير سورة ${surahNumber}`;

  return sendAiMessage(message);
};

/**
 * Get Islamic ruling (fatwa) using AI
 * @param question - The Islamic question
 * @returns Promise with fatwa response
 */
export const getIslamicRuling = async (
  question: string
): Promise<AiChatResponse> => {
  const response = await api.post<AiChatResponse>("/ai-chat", {
    message: `ما حكم ${question}`,
  });
  return response.data;
};
