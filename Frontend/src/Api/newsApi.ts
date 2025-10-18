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
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Helper function to build image URLs
const buildImageUrl = (imagePath: string): string => {
  if (!imagePath)
    return "https://placehold.co/600x400/e9f5f2/1f6357?text=صورة+جديدة";
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_BASE_URL}/${imagePath}`;
};

// Helper function to format dates
const formatDate = (dateInput: string | Date): string => {
  try {
    const date = new Date(dateInput);
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.error("Date formatting error:", error);
    return new Date().toLocaleDateString("ar-SA");
  }
};

// Get all news
export const getAllNews = async (): Promise<INews[]> => {
  const response = await api.get("/news");
  const newsData = response.data;

  // Process each news item to format dates and build proper image URLs
  return newsData.map((item: INews) => ({
    ...item,
    date: formatDate(item.date || item.createdAt || new Date()),
    image: buildImageUrl(item.image),
  }));
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
  return response.data;
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
  return response.data;
};

// Delete news
export const deleteNews = async (id: string): Promise<void> => {
  await api.delete(`/news/${id}`);
};

// Export helper function for building image URLs (for use in components)
export const buildNewsImageUrl = buildImageUrl;
