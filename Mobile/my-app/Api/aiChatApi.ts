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

// ═══════════════════════════════════════════════════════════════════════════
// 🔊 TTS - تحويل النص إلى صوت
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate speech from text (Text-to-Speech)
 * @param text - The text to convert to speech
 * @returns Promise with audio blob
 */
export const generateSpeech = async (text: string): Promise<Blob> => {
  const response = await api.post("/ai-chat/speak", { text }, {
    responseType: "blob",
    timeout: 60000
  });
  return response.data;
};

// ═══════════════════════════════════════════════════════════════════════════
// 🎤 STT - تحويل الصوت إلى نص
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Transcribe audio to text (Speech-to-Text)
 * @param audioUri - The URI of the audio file
 * @returns Promise with transcribed text
 */
export const transcribeAudio = async (audioUri: string): Promise<{ success: boolean; text: string }> => {
  const formData = new FormData();
  
  // For React Native, we need to handle file differently
  formData.append("audio", {
    uri: audioUri,
    type: "audio/webm",
    name: "recording.webm"
  } as any);
  
  const response = await api.post("/ai-chat/transcribe", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 60000
  });
  return response.data;
};

// ═══════════════════════════════════════════════════════════════════════════
// ⭐ Favorites - المفضلات
// ═══════════════════════════════════════════════════════════════════════════

export interface Favorite {
  _id: string;
  user: string;
  question: string;
  answer: string;
  tags: string[];
  note: string;
  createdAt: string;
}

export interface GetFavoritesParams {
  search?: string;
  tag?: string;
  page?: number;
  limit?: number;
}

export interface FavoriteData {
  question: string;
  answer: string;
  tags?: string[];
  note?: string;
}

export interface FavoriteUpdateData {
  tags?: string[];
  note?: string;
}

export interface FavoritesResponse {
  success: boolean;
  data: Favorite[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

/**
 * Add a message to favorites
 */
export const addFavorite = async (data: FavoriteData): Promise<{ success: boolean; data: Favorite }> => {
  const response = await api.post("/ai-chat/favorites", data);
  return response.data;
};

/**
 * Get user's favorites
 */
export const getFavorites = async (params?: GetFavoritesParams): Promise<FavoritesResponse> => {
  const response = await api.get("/ai-chat/favorites", { params });
  return response.data;
};

/**
 * Get all unique tags
 */
export const getFavoriteTags = async (): Promise<{ success: boolean; data: { name: string; count: number }[] }> => {
  const response = await api.get("/ai-chat/favorites/tags");
  return response.data;
};

/**
 * Update a favorite
 */
export const updateFavorite = async (id: string, data: FavoriteUpdateData): Promise<{ success: boolean; data: Favorite }> => {
  const response = await api.put(`/ai-chat/favorites/${id}`, data);
  return response.data;
};

/**
 * Delete a favorite
 */
export const deleteFavorite = async (id: string): Promise<{ success: boolean }> => {
  const response = await api.delete(`/ai-chat/favorites/${id}`);
  return response.data;
};
