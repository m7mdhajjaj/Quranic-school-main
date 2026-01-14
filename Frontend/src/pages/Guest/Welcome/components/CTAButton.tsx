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
          ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30'
          : 'bg-white/10 backdrop-blur-md text-white border border-white/20'
      }`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.2 + delay }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Shimmer Effect for Primary */}
      {primary && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />
      )}

      {/* Hover Glow */}
      <motion.div
        className={`absolute inset-0 ${
          primary 
            ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400' 
            : 'bg-white/20'
        } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      {/* Button Content */}
      <span className="relative z-10 flex items-center justify-center gap-3">
        {children}
        {icon && (
          <motion.span
            className="inline-block"
            animate={{ x: [0, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {icon}
          </motion.span>
        )}
      </span>

      {/* Particle Effect on Hover */}
      <AnimatePresence>
        {primary && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${10 + i * 10}%`,
                  bottom: 0,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
