import api from './api';

// ============================================================================
// News API
// ============================================================================

export interface INews {
  _id: string;
  title: string;
  content: string;
  date: string;
  image: string;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Get all news
export const getAllNews = async (): Promise<INews[]> => {
  const response = await api.get('/news');
  return response.data;
};

// Create news with FormData (image upload)
export const createNews = async (formData: FormData): Promise<INews> => {
  const response = await api.post('/news', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Update news
export const updateNews = async (id: string, formData: FormData): Promise<INews> => {
  const response = await api.put(`/news/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete news
export const deleteNews = async (id: string): Promise<void> => {
  await api.delete(`/news/${id}`);
};
