import axios from "axios";

const API_URL = "http://localhost:5005/api/upload";

export interface UploadResponse {
  success: boolean;
  message: string;
  url?: string;
  publicId?: string;
}

export interface MultipleUploadResponse {
  success: boolean;
  message: string;
  files?: Array<{ url: string; publicId: string }>;
}

/**
 * رفع صورة واحدة للأنشطة
 */
export const uploadActivityImage = async (
  file: File
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await axios.post(`${API_URL}/activity`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

/**
 * رفع صورة واحدة للأخبار
 */
export const uploadNewsImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await axios.post(`${API_URL}/news`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

/**
 * رفع عدة صور للأنشطة
 */
export const uploadMultipleActivityImages = async (
  files: File[]
): Promise<MultipleUploadResponse> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images", file);
  });

  const response = await axios.post(`${API_URL}/activity/multiple`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

/**
 * رفع عدة صور للأخبار
 */
export const uploadMultipleNewsImages = async (
  files: File[]
): Promise<MultipleUploadResponse> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images", file);
  });

  const response = await axios.post(`${API_URL}/news/multiple`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

/**
 * حذف صورة من Cloudinary
 * @param publicId معرف الصورة في Cloudinary (يتم الحصول عليه من الرفع)
 */
export const deleteImage = async (
  publicId: string
): Promise<{ success: boolean; message: string }> => {
  // استخراج الـ public_id الصحيح من الـ URL إذا لزم الأمر
  const cleanPublicId = publicId.includes("/")
    ? publicId
        .split("/")
        .slice(-2)
        .join("/")
        .replace(/\.[^/.]+$/, "")
    : publicId;

  const response = await axios.delete(
    `${API_URL}/${encodeURIComponent(cleanPublicId)}`
  );
  return response.data;
};
