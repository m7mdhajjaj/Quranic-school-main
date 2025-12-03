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
    return 'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 border-emerald-200/60 shadow-lg shadow-emerald-500/40';
  }
  if (gender === 'أنثى') {
    return 'bg-gradient-to-br from-pink-400 via-rose-500 to-fuchsia-600 border-pink-200/60 shadow-lg shadow-pink-500/40';
  }
  return 'bg-gradient-to-br from-gray-400 via-slate-500 to-gray-600 border-gray-200/60 shadow-lg shadow-gray-500/40';
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
  return src || userAvatar?.url || fetchedAvatarUrl || null;
};

/**
 * دوال Status
 */

export const getStatusTitle = (
  forceStatus?: 'online' | 'offline' | 'active' | 'inactive',
  userIsOnline?: boolean
): string => {
  if (forceStatus) {
    if (forceStatus === 'online' || forceStatus === 'active') {
      return 'نشط (مفروض)';
    }
    return 'غير نشط (مفروض)';
  }
  return userIsOnline ? 'نشط' : 'غير نشط';
};

export const getStatusColor = (
  loading: boolean,
  userIsOnline: boolean
): string => {
  if (loading) return 'bg-gray-400';
  return userIsOnline ? 'bg-green-500' : 'bg-gray-400';
};

export const getStatusText = (
  loading: boolean,
  userIsOnline: boolean
): string => {
  if (loading) return 'غير نشط';
  return userIsOnline ? 'نشط الآن' : 'غير نشط';
};

export const getStatusDotSize = (statusSize: 'sm' | 'md' | 'lg'): string => {
  switch (statusSize) {
    case 'sm':
      return 'w-2 h-2';
    case 'lg':
      return 'w-4 h-4';
    default:
      return 'w-3 h-3';
  }
};
