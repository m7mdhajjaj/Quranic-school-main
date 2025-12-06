import React from 'react';
import { Button, Input, ToggleSwitch, Alert, Tooltip } from "@/components/UI";
import { LogIn, Info } from 'lucide-react';
import type { LoginFormData } from '../types';

interface LoginFormProps {
  formData: LoginFormData;
  error: string;
  isLoading: boolean;
  rememberMe: boolean;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRememberMeChange: (checked: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  formData,
  error,
  isLoading,
  rememberMe,
  onFormChange,
  onRememberMeChange,
  onSubmit,
  onForgotPassword,
}) => {
  return (
    <div>
      {/* Error Message */}
      {error && (
        <Alert variant="danger" className="mb-4 sm:mb-6">
          {error}
        </Alert>
      )}

      {/* Login Form */}
      <form className="space-y-4" onSubmit={onSubmit}>
        <Input
          label="رقم المستخدم"
          id="userId"
          name="userId"
          type="text"
          value={formData.userId}
          onChange={onFormChange}
          placeholder="أدخل رقم المستخدم"
          autoComplete="username"
          required
        />

        <Input
          label="كلمة المرور / رقم الهوية"
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={onFormChange}
          placeholder="أدخل كلمة المرور أو رقم الهوية"
          autoComplete="current-password"
          required
          showPasswordToggle={true}
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Toggle Switch */}
            <ToggleSwitch
              checked={rememberMe}
              onChange={onRememberMeChange}
              label="تذكرني"
              size="md"
              color="emerald"
            />

            {/* Info Icon with Tooltip */}
            <Tooltip
              position="top"
              content={
                <div className="space-y-2 text-right">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>مدة الجلسة</span>
                  </div>

                  {rememberMe ? (
                    <div className="space-y-1">
                      <p className="text-gray-800 text-xs font-semibold">
                        ✅ مفعّل: 7 أيام
                      </p>
                      <p className="text-emerald-600 text-xs">
                        ستبقى متصلاً حتى تسجيل الخروج
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-gray-800 text-xs font-semibold">
                        ⏰ غير مفعّل: 30 دقيقة
                      </p>
                      <p className="text-orange-600 text-xs">
                        سيتم تسجيل الخروج تلقائياً بعد 30 دقيقة
                      </p>
                    </div>
                  )}
                </div>
              }
            >
              <button
                type="button"
                className="p-1 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-400 transition-all duration-300"
                aria-label="معلومات الجلسة">
                <Info className="w-3.5 h-3.5 text-emerald-600" />
              </button>
            </Tooltip>
          </div>

          <button
            type="button"
            onClick={onForgotPassword}
            className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition-colors duration-200">
            نسيت كلمة المرور؟
          </button>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          loading={isLoading}
          gradient={true}
          leftIcon={!isLoading && <LogIn className="w-4 h-4" />}
          className="shadow-lg hover:shadow-xl hover:shadow-emerald-500/30 focus:ring-2 focus:ring-emerald-400/30"
        >
          {isLoading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
        </Button>
      </form>
    </div>
  );
};
