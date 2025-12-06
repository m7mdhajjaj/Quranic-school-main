import { Alert, Button, Input } from '@/components/UI';
import { DatePicker } from './DatePicker';
import type { ForgotPasswordFormData, FieldErrors } from '../../types';

interface VerificationFormProps {
  formData: ForgotPasswordFormData;
  fieldErrors: FieldErrors;
  error: string;
  isLoading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const VerificationForm = ({
  formData,
  fieldErrors,
  error,
  isLoading,
  onChange,
  onSubmit,
  onCancel,
}: VerificationFormProps) => {
  return (
    <form className="space-y-3 sm:space-y-4" onSubmit={onSubmit}>
      <Alert variant="info">
        <p className="text-xs sm:text-sm font-medium">معلومة هامة</p>
        <p className="text-[10px] sm:text-xs mt-1">
          الرجاء إدخال بياناتك الشخصية بدقة كما هي مسجلة في النظام للتحقق من
          هويتك
        </p>
      </Alert>

      {error && (
        <Alert variant="danger" onClose={() => {}}>
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Input
          label="الاسم الأول"
          name="firstName"
          value={formData.firstName}
          onChange={onChange}
          error={fieldErrors.firstName}
          placeholder="أدخل الاسم الأول"
          required
        />
        <Input
          label="اسم الأب"
          name="fatherName"
          value={formData.fatherName}
          onChange={onChange}
          error={fieldErrors.fatherName}
          placeholder="أدخل اسم الأب"
          required
        />
        <Input
          label="اسم الجد"
          name="grandFatherName"
          value={formData.grandFatherName}
          onChange={onChange}
          error={fieldErrors.grandFatherName}
          placeholder="أدخل اسم الجد"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Input
          label="اسم العائلة"
          name="lastName"
          value={formData.lastName}
          onChange={onChange}
          error={fieldErrors.lastName}
          placeholder="أدخل اسم العائلة"
          required
        />
        <Input
          label="اسم الأم"
          name="motherName"
          value={formData.motherName}
          onChange={onChange}
          error={fieldErrors.motherName}
          placeholder="أدخل اسم الأم الكامل"
          required
        />
        <Input
          label="رقم الهوية"
          name="idNumber"
          type="text"
          value={formData.idNumber}
          onChange={onChange}
          error={fieldErrors.idNumber}
          placeholder="أدخل رقم الهوية (9 أرقام)"
          maxLength={9}
          required
        />
      </div>

      <DatePicker
        label="تاريخ الميلاد"
        name="birthDate"
        value={formData.birthDate}
        onChange={onChange}
        error={fieldErrors.birthDate}
        placeholder="اختر تاريخ الميلاد"
        maxDate={new Date().toISOString().split('T')[0]}
        required
      />

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
          leftIcon={
            !isLoading && (
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )
          }
        >
          {isLoading ? 'جارٍ التحقق...' : 'تحقق من البيانات'}
        </Button>
      </div>
    </form>
  );
};
