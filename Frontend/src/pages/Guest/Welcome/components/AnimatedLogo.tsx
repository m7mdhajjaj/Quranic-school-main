// ============================================================================
// AnimatedLogo.tsx - اللوجو المتحرك
// ============================================================================

import { motion } from 'framer-motion';
import { FaQuran } from 'react-icons/fa';

export const AnimatedLogo = () => {
  return (
    <motion.div
      className="relative mb-10"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 200, 
        damping: 15,
        delay: 0.2 
      }}
    >
      {/* Outer Glow Ring - مبسط للأداء */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          border: '2px solid rgba(16, 185, 129, 0.3)',
          transform: 'scale(1)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0, 0.3],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Main Logo Container */}
      <motion.div
        className="relative w-36 h-36 md:w-44 md:h-44"
        whileHover={{ scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {/* Rotating Border - مبسط */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, #10b981, #14b8a6, #06b6d4, #10b981)',
            padding: 3,
            willChange: 'transform',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-900 to-teal-900" />
        </motion.div>

        {/* Inner Circle with Icon */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-700 flex items-center justify-center shadow-2xl">
          <FaQuran className="text-5xl md:text-6xl text-white drop-shadow-lg" />
        </div>
      </motion.div>
    </motion.div>
  );
};
