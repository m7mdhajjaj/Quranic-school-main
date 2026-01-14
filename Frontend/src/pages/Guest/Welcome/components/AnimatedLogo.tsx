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
      {/* Outer Glow Rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full"
          style={{
            border: `${2 - i * 0.5}px solid rgba(16, 185, 129, ${0.3 - i * 0.1})`,
            transform: `scale(${1 + i * 0.2})`,
          }}
          animate={{
            scale: [1 + i * 0.2, 1.4 + i * 0.2, 1 + i * 0.2],
            opacity: [0.3 - i * 0.1, 0, 0.3 - i * 0.1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Main Logo Container */}
      <motion.div
        className="relative w-36 h-36 md:w-44 md:h-44"
        whileHover={{ scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {/* Rotating Border */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, #10b981, #14b8a6, #06b6d4, #10b981)',
            padding: 3,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-900 to-teal-900" />
        </motion.div>

        {/* Inner Circle with Icon */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-2xl overflow-hidden">
          {/* Shimmer Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
          <FaQuran className="text-5xl md:text-6xl text-white relative z-10 drop-shadow-lg" />
        </div>
      </motion.div>
    </motion.div>
  );
};
