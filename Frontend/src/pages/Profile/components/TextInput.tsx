// components/TextInput.tsx
import { AlertCircle } from "lucide-react";

interface TextInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  onBlur?: () => void;
  maxLength?: number;
  inputMode?: "text" | "numeric" | "tel" | "email" | "url";
}

export const TextInput = ({
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  onBlur,
  maxLength,
  inputMode,
}: TextInputProps) => (
  <div className="w-full" dir="rtl">
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      maxLength={maxLength}
      inputMode={inputMode}
      className={`w-full border-2 ${
        error
          ? "border-red-300 focus:border-red-500 focus:ring-red-500/30 bg-red-50/50"
          : "border-gray-200 focus:border-teal-500 focus:ring-teal-500/30 bg-white"
      } rounded-xl px-4 py-3 focus:outline-none focus:ring-4 hover:border-teal-300 hover:shadow-md transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium text-right shadow-sm`}
    />
    {error && (
      <p className="text-red-600 text-sm mt-1 ml-2 flex items-center gap-1 text-right">
        <AlertCircle className="w-4 h-4" />
        {error}
      </p>
    )}
  </div>
);
