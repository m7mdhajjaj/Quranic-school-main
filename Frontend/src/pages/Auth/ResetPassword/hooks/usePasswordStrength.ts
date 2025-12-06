import { useMemo } from 'react';

interface PasswordStrengthResult {
  score: number;
  label: string;
  color: string;
}

export const usePasswordStrength = (password: string): PasswordStrengthResult => {
  return useMemo(() => {
    if (!password) return { score: 0, label: '', color: 'bg-gray-300' };

    let score = 0;
    const numberCount = (password.match(/[\d٠-٩]/g) || []).length;
    const letterCount = (password.match(/[a-zA-Z\u0600-\u06FF]/g) || []).length;
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    // الطول
    if (password.length >= 4) score += 25;
    if (password.length >= 8) score += 15;
    if (password.length >= 12) score += 10;

    // الأحرف والأرقام
    if (letterCount >= 3 && numberCount >= 1) score += 25;
    if (numberCount >= 4) score += 15;

    // التنوع
    if (letterCount > 0 && numberCount > 0) score += 10;
    if (hasSpecialChars) score += 15;

    // تحديد التصنيف واللون
    if (score >= 75) return { score, label: 'قوية جداً', color: 'bg-green-600' };
    if (score >= 50) return { score, label: 'قوية', color: 'bg-green-500' };
    if (score >= 25) return { score, label: 'متوسطة', color: 'bg-yellow-500' };
    return { score, label: 'ضعيفة', color: 'bg-red-500' };
  }, [password]);
};
