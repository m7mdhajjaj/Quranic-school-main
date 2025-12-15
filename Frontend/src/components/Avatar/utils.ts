/**
 * Avatar Utility Functions
 * دوال مساعدة للـ Avatar component
 */

export type GenderType = 'male' | 'female' | 'ذكر' | 'أنثى';
export type NormalizedGender = 'ذكر' | 'أنثى' | 'male';

/**
 * تطبيع قيمة الجنس لدعم القيم العربية والإنجليزية
 */
export const normalizeGender = (
  gender?: string | GenderType
): NormalizedGender => {
  if (!gender) return 'male';

  const normalized = gender.toLowerCase().trim();

  if (normalized === 'male' || normalized === 'ذكر') return 'ذكر';
  if (normalized === 'female' || normalized === 'أنثى' || normalized === 'انثى')
    return 'أنثى';

  return 'male';
};

/**
 * الحصول على لون الخلفية حسب الجنس مع gradients جميلة
 */
export const getGenderColor = (gender: NormalizedGender): string => {
  if (gender === 'ذكر') {
    return 'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600';
  }
  if (gender === 'أنثى') {
    return 'bg-gradient-to-br from-pink-400 via-rose-500 to-fuchsia-600';
  }
  return 'bg-gradient-to-br from-gray-400 via-slate-500 to-gray-600';
};

/**
 * الحصول على لون النص (دائماً أبيض مع drop-shadow)
 */
export const getTextColor = (): string => {
  return 'text-white drop-shadow-lg';
};

/**
 * استخراج الأحرف الأولى من اسم المستخدم
 */
export const getUserInitials = (userName?: string): string => {
  if (!userName) return '';
  return userName.charAt(0).toUpperCase();
};

/**
 * الحصول على معلومات المستخدم من props مختلفة
 */
export const getUserInfo = (
  externalUserName?: string,
  user?: {
    firstName?: string;
    name?: string;
    gender?: string;
  },
  externalGender?: string
): {
  userName: string;
  initials: string;
  gender: NormalizedGender;
} => {
  const userName = externalUserName || user?.firstName || user?.name || '';
  const initials = getUserInitials(userName);
  const userGender = user?.gender || externalGender;
  const gender = normalizeGender(userGender);

  return { userName, initials, gender };
};

/**
 * الحصول على URL الصورة من مصادر مختلفة حسب الأولوية
 * مع التحقق من صحة URL
 */
export const getAvatarUrl = (
  src?: string | null,
  userAvatar?: { url?: string; publicId?: string },
  fetchedAvatarUrl?: string | null
): string | null => {
  // الأولوية:
  // 1. src مباشر
  // 2. user.avatar.url من Cloudinary
  // 3. fetchedAvatarUrl من API
  const url = src || userAvatar?.url || fetchedAvatarUrl || null;
  
  // التحقق من صحة URL
  if (!url) return null;
  
  // التحقق من أن URL يبدأ بـ http أو https
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    console.warn('⚠️ Invalid avatar URL format:', url);
    return null;
  }
  
  return url;
};

/**
 * التحقق من وجود الصورة (للاستخدام المستقبلي)
 * يمكن استخدامها لاحقاً للتحقق من وجود الصورة قبل تحميلها
 */
export const checkImageExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * دوال Status - تم إزالتها
 * الآن OnlineStatus component يتولى كل منطق الحالة من Context
 * هذه الدوال لم تعد مستخدمة بعد توحيد المنطق
 */
