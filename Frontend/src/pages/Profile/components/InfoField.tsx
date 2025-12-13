// components/InfoField.tsx
import React from "react";

interface InfoFieldProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

export const InfoField = ({ icon, label, value }: InfoFieldProps) => (
  <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all duration-300 p-5 hover:-translate-y-1" dir="rtl">
    <div className="flex items-start gap-4">
      {/* Icon - على اليمين في RTL */}
      <div className="flex-shrink-0 p-3 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl text-white shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
        {icon}
      </div>
      {/* Content - على اليسار في RTL */}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-gray-500 mb-2 text-right uppercase tracking-wide">
          {label}
        </div>
        <div className="text-lg font-bold text-gray-900 break-words text-right leading-relaxed">
          {value}
        </div>
      </div>
    </div>
  </div>
);
