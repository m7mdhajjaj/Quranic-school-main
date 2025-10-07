import api from './api';

// ============================================================================
// Settings API (Hero Image, etc.)
// ============================================================================

interface HeroImageResponse {
  success: boolean;
  heroImage: string;
}

// Get hero image
export const getHeroImage = async (): Promise<HeroImageResponse> => {
  const response = await api.get('/settings/hero-image');
  return response.data;
};

// Upload hero image
export const uploadHeroImage = async (formData: FormData): Promise<HeroImageResponse> => {
  const response = await api.post('/settings/hero-image', formData);
  return response.data;
};
