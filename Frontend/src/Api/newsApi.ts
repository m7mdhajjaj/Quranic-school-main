import api from "./api";
import { API_BASE_URL } from "../config/config";

// ============================================================================
// News API
// ============================================================================

export interface INews {
  _id: string;
  title: string;
  content: string;
  date: string;
  image: string;
  imagePublicId?: string;
  isPublished?: boolean;
  author?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
  } | string;
  authorName?: string;
  authorModel?: string;
  createdAt?: string;
  updatedAt?: string;
}


// Get all news
export const getAllNews = async (): Promise<INews[]> => {
  const response = await api.get("/news");
  const newsData = response.data.data; // Access the nested data array

  // Return raw data; formatting and image URL logic should be handled in components/utils
  return newsData;
};

// Create news (now accepts both FormData and plain object)
export const createNews = async (
  data: FormData | Partial<INews>
): Promise<INews> => {
  const isFormData = data instanceof FormData;

  console.log("Creating news with data:", data);
  console.log("Is FormData?", isFormData);

  const response = await api.post("/news", data, {
    headers: isFormData
      ? {
          "Content-Type": "multipart/form-data",
        }
      : undefined, // Let axios set default headers for JSON
  });
  return response.data.data; // Extract the nested data property
};

// Update news (now accepts both FormData and plain object)
export const updateNews = async (
  id: string,
  data: FormData | Partial<INews>
): Promise<INews> => {
  const isFormData = data instanceof FormData;

  console.log("Updating news with data:", data);
  console.log("Is FormData?", isFormData);

  const response = await api.put(`/news/${id}`, data, {
    headers: isFormData
      ? {
          "Content-Type": "multipart/form-data",
        }
      : undefined, // Let axios set default headers for JSON
  });
  return response.data.data; // Extract the nested data property
};

// Delete news
export const deleteNews = async (id: string): Promise<void> => {
  await api.delete(`/news/${id}`);
};

