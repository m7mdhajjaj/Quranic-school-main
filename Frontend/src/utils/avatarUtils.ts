/**
 * Utility functions for generating default avatars based on user information
 */

/**
 * Generate avatar initials from user name
 * Supports Arabic and English names
 */
export function generateAvatarInitials(user: {
  firstName?: string;
  lastName?: string;
  name?: string;
}): string {
  if (!user) return '';

  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  const fullName = user.name || '';

  // Try to get initials from firstName and lastName
  if (firstName && lastName) {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  // Try to get initials from firstName only
  if (firstName) {
    const parts = firstName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return firstName.charAt(0).toUpperCase();
  }

  // Try to get initials from full name
  if (fullName) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return fullName.charAt(0).toUpperCase();
  }

  return '';
}

/**
 * Generate CSS classes for gender-based avatar colors
 */
export function generateAvatarColorClasses(gender?: string): string {
  if (!gender) {
    return 'bg-gradient-to-br from-gray-400 via-slate-500 to-gray-600 border-gray-200/60 shadow-lg shadow-gray-500/40';
  }

  const genderLower = gender.toLowerCase().trim();
  
  if (genderLower === 'male' || genderLower === 'ذكر') {
    return 'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 border-emerald-200/60 shadow-lg shadow-emerald-500/40';
  }
  
  if (genderLower === 'female' || genderLower === 'أنثى' || genderLower === 'انثى') {
    return 'bg-gradient-to-br from-pink-400 via-rose-500 to-fuchsia-600 border-pink-200/60 shadow-lg shadow-pink-500/40';
  }

  // Default case
  return 'bg-gradient-to-br from-gray-400 via-slate-500 to-gray-600 border-gray-200/60 shadow-lg shadow-gray-500/40';
}

/**
 * Generate a complete avatar configuration for a user
 */
export function generateDefaultAvatar(user: {
  firstName?: string;
  lastName?: string;
  name?: string;
  gender?: string;
}) {
  return {
    initials: generateAvatarInitials(user),
    colorClasses: generateAvatarColorClasses(user.gender),
    hasCustomAvatar: false,
  };
}

/**
 * Check if user has sufficient data for a good default avatar
 */
export function canGenerateDefaultAvatar(user: {
  firstName?: string;
  lastName?: string;
  name?: string;
}): boolean {
  return Boolean(user?.firstName || user?.lastName || user?.name);
}