// ============================================================================
// CTAButton.tsx - زر الدعوة لاتخاذ إجراء
// ============================================================================

import { motion, AnimatePresence } from 'framer-motion';

interface CTAButtonProps {
  onClick: () => void;
  primary?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  delay?: number;
}

export const CTAButton = ({ 
  onClick, 
  primary = false, 
  children, 
  icon, 
  delay = 0 
}: CTAButtonProps) => {
  return (
    <motion.button
      onClick={onClick}
      className={`relative group px-10 py-5 font-bold text-lg rounded-2xl overflow-hidden ${
        primary
          ? 'bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 text-white shadow-lg shadow-emerald-500/30'
          : 'bg-white/10 backdrop-blur-md text-white border border-white/20'
      }`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.2 + delay }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Hover Glow - مبسط */}
      <div
        className={`absolute inset-0 ${
          primary 
            ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400' 
            : 'bg-white/20'
        } opacity-0 group-hover:opacity-30 transition-opacity duration-300`}
      />

      {/* Button Content */}
      <span className="relative z-10 flex items-center justify-center gap-3">
        {children}
        {icon && (
          <span className="inline-block group-hover:-translate-x-1 transition-transform duration-300">
            {icon}
          </span>
        )}
      </span>
    </motion.button>
  );
};
