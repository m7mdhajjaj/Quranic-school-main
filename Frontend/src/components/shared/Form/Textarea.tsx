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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        className={`w-full px-4 py-2.5 border-2 rounded-lg transition-all resize-none ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
            : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-200'
        } focus:ring-2 focus:outline-none ${className || ''}`}
        required={required}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {!error && helperText && <p className="text-gray-500 text-xs mt-1">{helperText}</p>}
    </div>
  );
};
