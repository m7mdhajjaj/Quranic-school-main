export interface ForgotPasswordFormData {
  firstName: string;
  fatherName: string;
  grandFatherName: string;
  lastName: string;
  motherName: string;
  idNumber: string;
  birthDate: string;
}

export interface NewPasswordFormData {
  password: string;
  confirmPassword: string;
}

const FIELD_LABELS: Record<keyof ForgotPasswordFormData, string> = {
  firstName: "الاسم الأول",
  fatherName: "اسم الأب",
  grandFatherName: "اسم الجد",
  lastName: "اسم العائلة",
  motherName: "اسم الأم",
  idNumber: "رقم الهوية",
  birthDate: "تاريخ الميلاد",
};

const MIN_NAME_LENGTH = 2;
const MAX_ID_LENGTH = 9;
const MAX_AGE_IN_YEARS = 120;

const arabicDigitNormalizer = new Map<string, string>([
  ["٠", "0"],
  ["١", "1"],
  ["٢", "2"],
  ["٣", "3"],
  ["٤", "4"],
  ["٥", "5"],
  ["٦", "6"],
  ["٧", "7"],
  ["٨", "8"],
  ["٩", "9"],
]);

const normalizeDigits = (value: string) =>
  value
    .split("")
    .map((char) => arabicDigitNormalizer.get(char) ?? char)
    .join("");

export const sanitizeForgotPasswordData = (data: ForgotPasswordFormData): ForgotPasswordFormData => ({
  ...data,
  firstName: data.firstName.trim(),
  fatherName: data.fatherName.trim(),
  grandFatherName: data.grandFatherName.trim(),
  lastName: data.lastName.trim(),
  motherName: data.motherName.trim(),
  idNumber: normalizeDigits(data.idNumber.trim()),
  birthDate: data.birthDate.trim(),
});

export const sanitizeNewPasswordData = (data: NewPasswordFormData): NewPasswordFormData => ({
  password: data.password.trim(),
  confirmPassword: data.confirmPassword.trim(),
});

export const validateForgotPasswordData = (data: ForgotPasswordFormData): string[] => {
  const errors: string[] = [];

  (Object.keys(data) as Array<keyof ForgotPasswordFormData>).forEach((key) => {
    if (!data[key]) {
      errors.push(`يرجى إدخال ${FIELD_LABELS[key]}.`);
    }
  });

  const nameFields: Array<keyof ForgotPasswordFormData> = [
    "firstName",
    "fatherName",
    "grandFatherName",
    "lastName",
    "motherName",
  ];

  nameFields.forEach((key) => {
    if (data[key] && data[key].length < MIN_NAME_LENGTH) {
      errors.push(`يجب أن يحتوي ${FIELD_LABELS[key]} على حرفين على الأقل.`);
    }
  });

  if (data.idNumber) {
    if (!/^\d+$/.test(data.idNumber)) {
      errors.push("رقم الهوية يجب أن يحتوي على أرقام فقط.");
    } else if (data.idNumber.length !== MAX_ID_LENGTH) {
      errors.push(`رقم الهوية يجب أن يتكوّن من ${MAX_ID_LENGTH} أرقام.`);
    }
  }

  if (data.birthDate) {
    const birthDate = new Date(data.birthDate);
    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - MAX_AGE_IN_YEARS);

    if (Number.isNaN(birthDate.getTime())) {
      errors.push("يرجى إدخال تاريخ ميلاد صالح.");
    } else {
      if (birthDate > today) {
        errors.push("تاريخ الميلاد لا يمكن أن يكون في المستقبل.");
      }

      if (birthDate < minDate) {
        errors.push("تاريخ الميلاد غير منطقي، يرجى التحقق من التاريخ.");
      }
    }
  }

  return errors;
};

export const validateNewPasswordData = (data: NewPasswordFormData): string[] => {
  const errors: string[] = [];

  if (!data.password || !data.confirmPassword) {
    errors.push("يرجى إدخال كلمة المرور الجديدة وتأكيدها.");
    return errors;
  }

  if (data.password.length < 6) {
    errors.push("كلمة المرور الجديدة يجب أن تتكوّن من 6 أحرف على الأقل.");
  }

  if (data.password !== data.confirmPassword) {
    errors.push("كلمتا المرور غير متطابقتين.");
  }

  return errors;
};

