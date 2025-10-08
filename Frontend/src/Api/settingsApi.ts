import api from "./api";

// ============================================================================
// Settings API - Hero Image and Site Settings
// ============================================================================

export interface HeroImageData {
  success: boolean;
  heroImage: string;
  message?: string;
}

export interface HeroImageResponse {
  success: boolean;
  heroImage: string;
  imageUrl: string;
  message?: string;
}

// Get current hero image
export const getHeroImage = async (): Promise<HeroImageData> => {
  try {
    const response = await api.get("/settings/hero-image");
    return {
      success: true,
      heroImage:
        response.data.imageUrl ||
        response.data.heroImage ||
        "/src/images/officialPhoto.jpg",
    };
  } catch (error) {
    // ✅ استخدام الصورة الافتراضية بدون طباعة خطأ في Console
    // console.warn('Hero image not found, using fallback');
    return {
      success: false,
      heroImage: "/src/images/officialPhoto.jpg", // fallback image
    };
  }
};

// Upload new hero image
export const uploadHeroImage = async (
  formData: FormData
): Promise<HeroImageResponse> => {
  try {
    const response = await api.post("/settings/hero-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return {
      success: true,
      heroImage: response.data.heroImage || response.data.imageUrl,
      imageUrl: response.data.heroImage || response.data.imageUrl,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Failed to upload hero image:", error);
    throw error;
  }
};

// Update site settings
export const updateSiteSettings = async (settings: Record<string, unknown>) => {
  try {
    const response = await api.put("/settings/site", settings);
    return response.data;
  } catch (error) {
    console.error("Failed to update site settings:", error);
    throw error;
  }
};

// Get site settings
export const getSiteSettings = async () => {
  try {
    const response = await api.get("/settings/site");
    return response.data;
  } catch (error) {
    console.error("Failed to get site settings:", error);
    throw error;
  }
};
