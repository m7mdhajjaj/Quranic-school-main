import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  fullWidth = true,
  required,
  className,
  ...props
}) => {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-base font-semibold text-gray-700 mb-3">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        className={`w-full px-5 py-4 bg-white border-2 rounded-2xl transition-all resize-none text-right text-base shadow-sm ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
            : 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500'
        } focus:ring-2 focus:outline-none ${className || ''}`}
        required={required}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {!error && helperText && <p className="text-gray-500 text-xs mt-1">{helperText}</p>}
    </div>
  );
};

