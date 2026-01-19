import api from "./api";
import { API_URL as BASE_API_URL } from "@/config/config";

const UPLOAD_ENDPOINT = "/upload";

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
 * رفع صورة واحدة للأخبار
 */
export const uploadNewsImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post(`${UPLOAD_ENDPOINT}/news`, formData, {
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

  const response = await api.post(`${UPLOAD_ENDPOINT}/news/multiple`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

/**
 * رفع صورة اللوغو (يتم تخزينها في مجلد Logo في Cloudinary)
 */
export const uploadLogo = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post(`${UPLOAD_ENDPOINT}/logo`, formData, {
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
  try {
    const response = await api.get(`${UPLOAD_ENDPOINT}/logo`);
    return response.data;
  } catch (error) {
    console.error("Error in getLogo:", error);
    return { success: false, message: "فشل في جلب اللوغو" };
  }
};

/**
 * رفع صورة الهيرو (يتم تخزينها في مجلد Hero في Cloudinary)
 */
export const uploadHeroImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post(`${UPLOAD_ENDPOINT}/hero`, formData, {
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
  try {
    const response = await api.get(`${UPLOAD_ENDPOINT}/hero`);
    return response.data;
  } catch (error) {
    console.error("Error in getHeroImage:", error);
    return { success: false, message: "فشل في جلب صورة الهيرو" };
  }
};

/**
 * رفع صورة الأفاتار (صورة البروفايل) - يتم تخزينها في مجلد Avatars في Cloudinary
 */
export const uploadAvatar = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post(`${UPLOAD_ENDPOINT}/avatar`, formData, {
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

  const response = await api.delete(
    `${UPLOAD_ENDPOINT}/${encodeURIComponent(cleanPublicId)}`
  );
  return response.data;
};
