// ============================================================================
// Error handling utilities
// ============================================================================

/**
 * Handles fetch errors with optional authentication redirect
 */
export const handleFetchError = (error: unknown, message: string) => {
  console.error(`${message}:`, error);
  if (typeof error === "object" && error !== null && "response" in error) {
    const axiosError = error as { response?: { status?: number } };
    if (axiosError.response?.status === 401) {
      // خطأ في المصادقة
      console.warn("Authentication error, redirecting to login...");
    }
  }
};
