// components/InfoField.tsx
import React from "react";

interface InfoFieldProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

export const InfoField = ({ icon, label, value }: InfoFieldProps) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
    <div className="flex items-start gap-4">
      {/* Icon - Right Side */}
      <div className="flex-shrink-0 p-2.5 bg-teal-500 rounded-lg text-white">
        {icon}
      </div>
      {/* Content - Left Side */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-600 mb-1">{label}</div>
        <div className="text-base font-semibold text-gray-900 break-words">
          {value}
        </div>
      </div>
    </div>
  </div>
);
