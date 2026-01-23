import api from './api';

export interface AiChatMessage {
  message: string;
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

export interface GetFavoritesParams {
  search?: string;
  tag?: string;
  page?: number;
  limit?: number;
}

// Send message to AI
export const sendAiChatMessage = async (message: string, signal?: AbortSignal) => {
  const response = await api.post('/ai-chat', { message }, {
    timeout: 90000, // 90 ثانية للتفسير الطويل
    signal
  });
  return response.data;
};

// Generate speech from text (TTS)
export const generateSpeech = async (text: string) => {
  const response = await api.post('/ai-chat/speak', { text }, {
    responseType: 'blob', // Important: receive audio as blob
    timeout: 120000 // ✅ زيادة الـ timeout لـ 2 دقيقة للنصوص الطويلة
  });
  return response.data;
};

// Transcribe audio (Speech-to-Text)
export const transcribeAudio = async (audioBlob: Blob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  
  const response = await api.post('/ai-chat/transcribe', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60000
  });
  return response.data;
};


// Add favorite
export const addFavorite = async (data: FavoriteData) => {
  const response = await api.post('/ai-chat/favorites', data);
  return response.data;
};

// Get favorites
export const getFavorites = async (params?: GetFavoritesParams) => {
  const response = await api.get('/ai-chat/favorites', { params });
  return response.data;
};

// Get tags
export const getFavoriteTags = async () => {
  const response = await api.get('/ai-chat/favorites/tags');
  return response.data;
};

// Update favorite
export const updateFavorite = async (id: string, data: FavoriteUpdateData) => {
  const response = await api.put(`/ai-chat/favorites/${id}`, data);
  return response.data;
};

// Delete favorite
export const deleteFavorite = async (id: string) => {
  const response = await api.delete(`/ai-chat/favorites/${id}`);
  return response.data;
};

// Get Smart Suggestion
export const getSmartSuggestion = async () => {
  const response = await api.get('/ai-chat/suggestion');
  return response.data;
};
