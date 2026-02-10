// ============================================================================
// ExamFormModal.tsx - Unified Modal for Add/Edit Exam (Clean Code)
// ============================================================================

import { memo, useState, useEffect, useMemo, useCallback } from "react";
import { TransparentModal } from "./TransparentModal";
import { DatePicker } from "@/components/UI";

// ============================================================================
// Types & Interfaces
// ============================================================================

interface ExamFormData {
  name: string;
  date: string;
  time: string;
  subject?: string;
  type?: string;
  duration?: number;
  totalMarks?: number;
  passingMarks?: number;
}

interface ExamFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (examData: ExamFormData, selectedGroup?: string) => Promise<void>;
  role: "student" | "teacher" | "admin" | "secretary";
  teacherGroups: string[];
  loadingTeacherGroups?: boolean;
  initialData?: ExamFormData & { group?: string };
  mode: "add" | "edit";
}

// ============================================================================
// Constants
// ============================================================================

const EXAM_TYPES = [
  { value: "شفهي", label: "شفهي" },
  { value: "كتابي", label: "كتابي" },
  { value: "تقييم شامل", label: "تقييم شامل" },
] as const;

// دالة للحصول على تاريخ بعد يومين
const getDateAfterTwoDays = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 2); // إضافة يومين
  return date.toISOString().split("T")[0];
};

const DEFAULT_VALUES: ExamFormData = {
  name: "",
  date: getDateAfterTwoDays(), // تاريخ بعد يومين تلقائياً
  time: "12:00", // وقت افتراضي 12 ظهراً (بصيغة 24 ساعة)
  subject: "",
  type: "شفهي",
  duration: 60,
  totalMarks: 20,
  passingMarks: 10,
};

const DURATION_CONSTRAINTS = {
  min: 5,
  max: 120, // Max 9 hours (flexible)
} as const;

const MARKS_CONSTRAINTS = {
  min: 10,
  max: 100,
} as const;

// ============================================================================
// Utility Functions
// ============================================================================

const formatDateForInput = (date: string | Date): string => {
  if (typeof date === "string") {
    return date.split("T")[0];
  }
  return date.toISOString().split("T")[0];
};

// ============================================================================
// Sub-Components
// ============================================================================

interface FormSectionProps {
  title: string;
  icon: React.ReactNode;
  bgColor: string;
  children: React.ReactNode;
}

const FormSection = memo<FormSectionProps>(
  ({ title, icon, bgColor, children }) => (
    <div className={`${bgColor} rounded-xl p-5 space-y-4`}>
      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  ),
);

FormSection.displayName = "FormSection";

interface InputFieldProps {
  label: string;
  icon: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
}

const InputField = memo<InputFieldProps>(
  ({ label, icon, required, children }) => (
    <div>
      <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-2">
        {icon}
        {label}
        {required && <span className="text-rose-600">*</span>}
      </label>
      {children}
    </div>
  ),
);

InputField.displayName = "InputField";

// ============================================================================
// Main Component
// ============================================================================

export const ExamFormModal = memo<ExamFormModalProps>(
  ({
    open,
    onClose,
    onSubmit,
    role,
    teacherGroups,
    loadingTeacherGroups = false,
    initialData,
    mode,
  }) => {
    // ============================================================================
    // State Management
    // ============================================================================

    const [formData, setFormData] = useState<ExamFormData>(DEFAULT_VALUES);
    const [selectedGroup, setSelectedGroup] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ============================================================================
    // Memoized Values
    // ============================================================================

    // المعلم يحتاج لاختيار حلقة دائماً (سواء كانت الحلقات جاهزة أو لا زالت تُحمّل)
    const isTeacher = useMemo(() => role === "teacher", [role]);

    const isTeacherWithGroups = useMemo(
      () => role === "teacher" && teacherGroups.length > 0,
      [role, teacherGroups.length],
    );

    const defaultGroup = useMemo(
      () => (isTeacherWithGroups ? teacherGroups[0] : ""),
      [isTeacherWithGroups, teacherGroups],
    );

    // حساب الحد الأدنى للتاريخ حسب الوضع (إضافة أو تعديل)
    const minDateForPicker = useMemo(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // الإضافة والتعديل: بعد يومين على الأقل
      const minDate = new Date(today);
      minDate.setDate(minDate.getDate() + 2);
      return minDate.toISOString().split("T")[0];
    }, []);

    // نص التلميح للتاريخ
    const dateHint = useMemo(() => {
      return "📅 يجب أن يكون تاريخ الامتحان بعد يومين على الأقل من اليوم";
    }, []);

    const modalConfig = useMemo(
      () => ({
        add: {
          title: "إضافة امتحان جديد",
          submitText: "إضافة الامتحان",
          gradientFrom: "emerald-500",
          gradientTo: "teal-600",
        },
        edit: {
          title: "تعديل الامتحان",
          submitText: "حفظ التعديلات",
          gradientFrom: "emerald-500",
          gradientTo: "teal-600",
        },
      }),
      [],
    );

    const config = modalConfig[mode];

    // ============================================================================
    // Effects
    // ============================================================================

    useEffect(() => {
      if (open) {
        if (mode === "edit" && initialData) {
          setFormData({
            name: initialData.name || "",
            date: formatDateForInput(initialData.date || DEFAULT_VALUES.date),
            time: initialData.time || DEFAULT_VALUES.time,
            subject: initialData.subject || "",
            type: initialData.type || DEFAULT_VALUES.type,
            duration: initialData.duration || DEFAULT_VALUES.duration,
            totalMarks: initialData.totalMarks || DEFAULT_VALUES.totalMarks,
            passingMarks:
              initialData.passingMarks || DEFAULT_VALUES.passingMarks,
          });
          setSelectedGroup(initialData.group || defaultGroup);
        } else {
          setFormData(DEFAULT_VALUES);
          setSelectedGroup(defaultGroup);
        }
      }
    }, [open, mode, initialData, defaultGroup]);

    // ============================================================================
    // Callbacks
    // ============================================================================

    const updateFormField = useCallback(
      <K extends keyof ExamFormData>(field: K, value: ExamFormData[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
      },
      [],
    );

    const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
          await onSubmit(formData, selectedGroup);
          setFormData(DEFAULT_VALUES);
          setSelectedGroup(defaultGroup);
          onClose();
        } catch (error) {
          console.error("Form submission error:", error);
        } finally {
          setIsSubmitting(false);
        }
      },
      [formData, selectedGroup, onSubmit, defaultGroup, onClose, isSubmitting],
    );

    const handleClose = useCallback(() => {
      if (isSubmitting) return;
      setFormData(DEFAULT_VALUES);
      setSelectedGroup(defaultGroup);
      onClose();
    }, [defaultGroup, onClose, isSubmitting]);

    // ============================================================================
    // Render
    // ============================================================================

    return (
      <TransparentModal
        open={open}
        onClose={handleClose}
        maxWidth="max-w-4xl"
        ariaLabel={config.title}
        title={config.title}
        gradientFrom={config.gradientFrom}
        gradientTo={config.gradientTo}
        icon={
          mode === "add" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          )
        }>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Information */}
          <FormSection
            title="المعلومات الأساسية"
            bgColor="bg-gray-50"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Exam Name */}
              <InputField
                label="اسم الامتحان"
                required
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                }>
                <input
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition duration-200 outline-none"
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormField("name", e.target.value)}
                  placeholder="مثلاً: اختبار القرآن الشهري"
                  required
                  disabled={isSubmitting}
                />
              </InputField>

              {/* Subject */}
              <InputField
                label="المادة"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                }>
                <input
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition duration-200 outline-none"
                  type="text"
                  value={formData.subject || ""}
                  onChange={(e) => updateFormField("subject", e.target.value)}
                  placeholder="مثلاً: القرآن الكريم"
                  disabled={isSubmitting}
                />
              </InputField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Exam Type */}
              <InputField
                label="نوع الامتحان"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                }>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition duration-200 outline-none bg-white"
                  value={formData.type || "شفهي"}
                  onChange={(e) => updateFormField("type", e.target.value)}
                  disabled={isSubmitting}
                  title="نوع الامتحان">
                  {EXAM_TYPES.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </InputField>

              {/* Group Selection - للمعلم دائماً */}
              {isTeacher && (
                <InputField
                  label="الحلقة"
                  required
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  }>
                  {loadingTeacherGroups ? (
                    <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 flex items-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-emerald-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      جاري تحميل الحلقات...
                    </div>
                  ) : teacherGroups.length === 0 ? (
                    <div className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl bg-amber-50 text-amber-700">
                      ⚠️ لا توجد حلقات نشطة (فيها طلاب)
                    </div>
                  ) : (
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition duration-200 outline-none bg-white"
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      required
                      disabled={isSubmitting}
                      title="الحلقة">
                      {teacherGroups.map((group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                    </select>
                  )}
                </InputField>
              )}
            </div>
          </FormSection>

          {/* Section 2: Schedule */}
          <FormSection
            title="موعد الامتحان"
            bgColor="bg-emerald-50"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }>
            <div className="space-y-4">
              {/* Date - Full Width */}
              <div>
                <DatePicker
                  label="التاريخ"
                  value={formData.date}
                  onChange={(date) => updateFormField("date", date)}
                  required
                  minDate={minDateForPicker}
                  hint={dateHint}
                  disabled={isSubmitting}
                />
              </div>

              {/* Time and Duration - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Time - Combined HH:MM + AM/PM */}
                <InputField
                  label="الوقت"
                  required
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  }>
                  <div>
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition duration-200 outline-none bg-white"
                      value={formData.time || "12:00"}
                      onChange={(e) => updateFormField("time", e.target.value)}
                      required
                      disabled={isSubmitting}
                      title="الوقت من 12:00 ظهراً إلى 9:00 مساءً">
                      <option value="12:00">12:00 ظهراً</option>
                      <option value="12:30">12:30 ظهراً</option>
                      <option value="13:00">1:00 مساءً</option>
                      <option value="13:30">1:30 مساءً</option>
                      <option value="14:00">2:00 مساءً</option>
                      <option value="14:30">2:30 مساءً</option>
                      <option value="15:00">3:00 مساءً</option>
                      <option value="15:30">3:30 مساءً</option>
                      <option value="16:00">4:00 مساءً</option>
                      <option value="16:30">4:30 مساءً</option>
                      <option value="17:00">5:00 مساءً</option>
                      <option value="17:30">5:30 مساءً</option>
                      <option value="18:00">6:00 مساءً</option>
                      <option value="18:30">6:30 مساءً</option>
                      <option value="19:00">7:00 مساءً</option>
                      <option value="19:30">7:30 مساءً</option>
                      <option value="20:00">8:00 مساءً</option>
                      <option value="20:30">8:30 مساءً</option>
                      <option value="21:00">9:00 مساءً</option>
                    </select>

                    {/* Hint - الوقت المسموح */}
                    <p className="mt-2 text-xs text-emerald-600 flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      الوقت المسموح من 12:00 ظهراً إلى 9:00 مساءً
                    </p>
                  </div>
                </InputField>

                {/* Duration - يظهر لجميع أنواع الامتحانات */}
                <InputField
                  label="المدة (دقيقة)"
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  }>
                  <div>
                    <input
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition duration-200 outline-none"
                      type="number"
                      min={DURATION_CONSTRAINTS.min}
                      max={DURATION_CONSTRAINTS.max}
                      value={formData.duration || 60}
                      onChange={(e) =>
                        updateFormField(
                          "duration",
                          parseInt(e.target.value) || 60,
                        )
                      }
                      disabled={isSubmitting}
                      title="المدة بالدقائق (الحد الأقصى ساعتين)"
                    />
                    <p className="mt-2 text-xs text-emerald-600 flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      الحد الأقصى للمدة ساعتين (120 دقيقة)
                    </p>
                  </div>
                </InputField>
              </div>
            </div>
          </FormSection>

          {/* Section 3: Grading */}
          <FormSection
            title="نظام التقييم"
            bgColor="bg-emerald-50"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            }>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Total Marks */}
              <InputField
                label="مجموع الدرجات"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }>
                <input
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition duration-200 outline-none"
                  type="number"
                  min={MARKS_CONSTRAINTS.min}
                  max={MARKS_CONSTRAINTS.max}
                  value={formData.totalMarks || 100}
                  onChange={(e) =>
                    updateFormField(
                      "totalMarks",
                      parseInt(e.target.value) || 100,
                    )
                  }
                  disabled={isSubmitting}
                  title="مجموع الدرجات"
                />
              </InputField>

              {/* Passing Marks */}
              <InputField
                label="درجة النجاح"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                }>
                <input
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition duration-200 outline-none"
                  type="number"
                  min={0}
                  max={formData.totalMarks || 100}
                  value={formData.passingMarks || 50}
                  onChange={(e) =>
                    updateFormField(
                      "passingMarks",
                      parseInt(e.target.value) || 50,
                    )
                  }
                  disabled={isSubmitting}
                  title="درجة النجاح"
                />
              </InputField>
            </div>
          </FormSection>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition duration-200 border-2 border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 bg-gradient-to-r from-${config.gradientFrom} to-${config.gradientTo} hover:from-${config.gradientFrom.replace("500", "600")} hover:to-${config.gradientTo.replace("600", "700")} text-white font-medium py-3 px-8 rounded-xl transition duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}>
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري الحفظ...
                </span>
              ) : (
                config.submitText
              )}
            </button>
          </div>
        </form>
      </TransparentModal>
    );
  },
);

ExamFormModal.displayName = "ExamFormModal";
