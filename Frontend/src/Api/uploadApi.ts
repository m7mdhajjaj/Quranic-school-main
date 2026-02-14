import axios from "axios";
import { API_URL } from "../config/config";

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

export interface HeroImage {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  createdAt?: string;
}

export interface AllHeroImagesResponse {
  success: boolean;
  images: HeroImage[];
  total: number;
  message?: string;
}

/**
 * رفع صورة واحدة للأخبار
 */
export const uploadNewsImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await axios.post(`${API_URL}/upload/news`, formData, {
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
  files: File[],
): Promise<MultipleUploadResponse> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images", file);
  });

  const response = await axios.post(
    `${API_URL}/upload/news/multiple`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

/**
 * رفع صورة اللوغو (يتم تخزينها في مجلد Logo في Cloudinary)
 */
export const uploadLogo = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await axios.post(`${API_URL}/upload/logo`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

/**
 * جلب صورة اللوغو الحالية
 */
export const getLogo = async (): Promise<UploadResponse> => {
  const response = await axios.get(`${API_URL}/upload/logo`);
  return response.data;
};

/**
 * رفع صورة الهيرو (يتم تخزينها في مجلد Hero في Cloudinary)
 */
export const uploadHeroImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await axios.post(`${API_URL}/upload/hero`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

/**
 * جلب صورة الهيرو الحالية
 */
export const getHeroImage = async (): Promise<UploadResponse> => {
  const response = await axios.get(`${API_URL}/upload/hero`);
  return response.data;
};

/**
 * جلب جميع صور الهيرو للكاروسيل
 */
export const getAllHeroImages = async (): Promise<AllHeroImagesResponse> => {
  const response = await axios.get(`${API_URL}/upload/hero/all`);
  return response.data;
};

/**
 * حذف صورة هيرو
 */
export const deleteHeroImage = async (
  publicId: string,
): Promise<{ success: boolean; message: string }> => {
  const response = await axios.delete(
    `${API_URL}/upload/hero/${encodeURIComponent(publicId)}`,
  );
  return response.data;
};

/**
 * رفع صورة الأفاتار (صورة البروفايل) - يتم تخزينها في مجلد Avatars في Cloudinary
 */
export const uploadAvatar = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await axios.post(`${API_URL}/upload/avatar`, formData, {
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
  publicId: string,
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
    `${API_URL}/upload/${encodeURIComponent(cleanPublicId)}`,
  );
  return response.data;
};
