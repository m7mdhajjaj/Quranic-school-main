/**
 * Avatar Utility Functions - React Native
 * دوال مساعدة للـ Avatar component
 */

export type GenderType = "male" | "female" | "ذكر" | "أنثى";
export type NormalizedGender = "ذكر" | "أنثى" | "male";

/**
 * تطبيع قيمة الجنس لدعم القيم العربية والإنجليزية
 */
export const normalizeGender = (
  gender?: string | GenderType
): NormalizedGender => {
  if (!gender) return "male";

  const normalized = gender.toLowerCase().trim();

  if (normalized === "male" || normalized === "ذكر") return "ذكر";
  if (normalized === "female" || normalized === "أنثى" || normalized === "انثى")
    return "أنثى";

  return "male";
};

/**
 * الحصول على لون الخلفية حسب الجنس
 */
export const getGenderColor = (gender: NormalizedGender): string => {
  if (gender === "ذكر") {
    return "#10b981"; // emerald-500
  }
  if (gender === "أنثى") {
    return "#ec4899"; // pink-500
  }
  return "#6b7280"; // gray-500
};

/**
 * الحصول على لون النص
 */
export const getTextColor = (): string => {
  return "#ffffff";
};

/**
 * استخراج أول حرف من اسم المستخدم (من الاسم الأول فقط)
 */
export const getUserInitials = (userName?: string): string => {
  if (!userName) return "";

  const trimmedName = userName.trim();
  if (!trimmedName) return "";

  const firstWord = trimmedName.split(" ")[0];
  return firstWord.charAt(0).toUpperCase();
};

/**
 * الحصول على معلومات المستخدم من user object
 */
export const getUserInfo = (user?: {
  _id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  gender?: string;
  role?: string;
  isActive?: boolean;
  avatar?: {
    url?: string;
    publicId?: string;
  };
}) => {
  if (!user) return null;

  const fullName =
    user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim();

  return {
    id: user._id,
    name: fullName,
    firstName: user.firstName,
    lastName: user.lastName,
    gender: user.gender,
    role: user.role,
    isActive: user.isActive,
    avatarUrl: user.avatar?.url,
  };
};

/**
 * الحصول على URL الصورة من Cloudinary
 */
export const getAvatarUrl = (user?: {
  avatar?: {
    url?: string;
    publicId?: string;
  };
}): string | null => {
  if (!user?.avatar?.url) return null;
  return user.avatar.url;
};
