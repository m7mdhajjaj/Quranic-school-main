// ============================================================================
// Field Component
// ============================================================================

import React from "react";

interface FieldProps {
  label: string;
  children: React.ReactNode;
  htmlFor?: string;
  hint?: string;
  required?: boolean;
}

export const Field: React.FC<FieldProps> = ({
  label,
  children,
  htmlFor,
  hint,
  required,
}) => (
  <div>
    <label htmlFor={htmlFor} className="block mb-1 font-bold text-emerald-700">
      {label} {required ? <span className="text-rose-600">*</span> : null}
    </label>
    {children}
    {hint ? (
      <p className="text-[12px] text-emerald-900/60 mt-1">{hint}</p>
    ) : null}
  </div>
);
