// ============================================================================
// helpers.ts - General Helper Functions
// ============================================================================

/**
 * Combines class names, filtering out falsy values
 */
export const cn = (...cls: Array<string | false | null | undefined>) =>
  cls.filter(Boolean).join(' ');

/**
 * Gets user role from localStorage
 */
export const getUserRole = (): 'student' | 'teacher' | 'admin' => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return 'student';
    const parsed = JSON.parse(raw);
    return (parsed?.role as 'student' | 'teacher' | 'admin') ?? 'student';
  } catch {
    return 'student';
  }
};

/**
 * Handles fetch errors with optional authentication redirect
 */
export const handleFetchError = (error: unknown, message: string) => {
  console.error(`${message}:`, error);
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as { response?: { status?: number } };
    if (axiosError.response?.status === 401) {
      // خطأ في المصادقة
      console.warn('Authentication error, redirecting to login...');
    }
  }
};
