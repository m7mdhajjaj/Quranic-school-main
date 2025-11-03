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
  <div className="w-full">
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
          ? "border-red-300 focus:border-red-500 focus:ring-red-500/30"
          : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/30"
      } rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-4 hover:border-emerald-300 transition-all duration-300 text-slate-900 placeholder-slate-400 font-medium`}
    />
    {error && (
      <p className="text-red-600 text-sm mt-1 mr-2 flex items-center gap-1">
        <AlertCircle className="w-4 h-4" />
        {error}
      </p>
    )}
  </div>
);
