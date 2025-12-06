import { Key } from 'lucide-react';
import { Alert, Button, Input } from '@/components/UI';
import { PasswordRequirements, PasswordStrengthIndicator } from '@/components/Auth';
import type { NewPasswordData, FieldErrors, PasswordStrengthResult } from '../../types';

interface NewPasswordFormProps {
  formData: NewPasswordData;
  fieldErrors: FieldErrors;
  error: string;
  isLoading: boolean;
  passwordStrength: PasswordStrengthResult;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const NewPasswordForm = ({
  formData,
  fieldErrors,
  error,
  isLoading,
  passwordStrength,
  onChange,
  onSubmit,
  onCancel,
}: NewPasswordFormProps) => {
  return (
    <form className="space-y-3 sm:space-y-4" onSubmit={onSubmit}>
      <Alert variant="success">
        <p className="text-xs sm:text-sm font-bold">تم التحقق من هويتك بنجاح!</p>
        <p className="text-[10px] sm:text-xs mt-1">
          يمكنك الآن إنشاء كلمة مرور جديدة وآمنة لحسابك
        </p>
      </Alert>

      {error && (
        <Alert variant="danger" onClose={() => {}}>
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="lg:col-span-3">
          <PasswordRequirements
            password={formData.password}
            className="animate-fadeIn h-full"
          />
        </div>
        <div className="flex items-stretch">
          <div className="w-full p-2 sm:p-3 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 backdrop-blur-sm rounded-lg border border-emerald-200/50 flex flex-col justify-center">
            <p className="text-[10px] sm:text-xs font-semibold text-emerald-900 mb-2 text-center">
              مؤشر القوة
            </p>
            <PasswordStrengthIndicator
              password={formData.password}
              score={passwordStrength.score}
              label={passwordStrength.label}
              color={passwordStrength.color}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Input
          label="كلمة المرور الجديدة"
          name="password"
          type="password"
          value={formData.password}
          onChange={onChange}
          error={fieldErrors.password}
          placeholder="أدخل كلمة المرور الجديدة (4 أحرف على الأقل)"
          minLength={4}
          showPasswordToggle
          autoComplete="new-password"
          required
        />

        <Input
          label="تأكيد كلمة المرور"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={onChange}
          error={fieldErrors.confirmPassword}
          placeholder="أعد إدخال كلمة المرور للتأكيد"
          minLength={4}
          showPasswordToggle
          autoComplete="new-password"
          required
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-3">
        <Button
          type="button"
          onClick={onCancel}
          variant="secondary"
          size="md"
          className="px-6 w-full sm:w-auto order-2 sm:order-1"
        >
          إلغاء
        </Button>

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          loading={isLoading}
          className="order-1 sm:order-2"
          leftIcon={!isLoading && <Key className="w-4 h-4 sm:w-5 sm:h-5" />}
        >
          {isLoading ? 'جارٍ التحديث...' : 'تحديث كلمة المرور'}
        </Button>
      </div>
    </form>
  );
};
