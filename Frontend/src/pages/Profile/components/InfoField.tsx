// components/InfoField.tsx
import React from "react";
import { motion } from "framer-motion";

interface InfoFieldProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

export const InfoField = ({ icon, label, value }: InfoFieldProps) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -4 }}
    whileTap={{ scale: 0.98 }}
    style={{ touchAction: "manipulation" }}
    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all duration-300 p-5 cursor-default"
    dir="rtl"
  >
    <div className="flex items-start gap-4">
      {/* Icon - على اليمين في RTL */}
      <motion.div
        whileHover={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 0.5 }}
        className="flex-shrink-0 p-3 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-700 rounded-xl text-white shadow-md group-hover:shadow-lg transition-all duration-300"
      >
        {icon}
      </motion.div>
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
  </motion.div>
);
