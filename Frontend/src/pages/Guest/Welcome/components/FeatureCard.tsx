// ============================================================================
// FeatureCard.tsx - بطاقة الميزة
// ============================================================================

import { motion } from 'framer-motion';
import { useFeatureCard } from '../useFeatureCard';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

export const FeatureCard = ({ icon, title, description, index }: FeatureCardProps) => {
  const { isHovered, handleHoverStart, handleHoverEnd } = useFeatureCard();

  return (
    <motion.div
      className="relative group cursor-pointer"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: 0.5 + index * 0.1,
        type: 'spring',
        stiffness: 100 
      }}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      whileHover={{ y: -10 }}
    >
      {/* Card Glow */}
      <motion.div
        className="absolute -inset-1 bg-gradient-to-r from-emerald-500/50 via-teal-500/50 to-cyan-500/50 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        animate={isHovered ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      />

      {/* Card Content */}
      <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 overflow-hidden">
        {/* Animated Background Gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 opacity-0 group-hover:opacity-100"
          transition={{ duration: 0.3 }}
        />

        {/* Corner Decorations */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-500/20 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-teal-500/20 to-transparent rounded-tr-full" />

        {/* Icon */}
        <motion.div
          className="text-5xl mb-4 text-emerald-400"
          animate={isHovered ? { 
            rotate: [0, -10, 10, -10, 0],
            scale: [1, 1.1, 1]
          } : {}}
          transition={{ duration: 0.5 }}
        >
          {icon}
        </motion.div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-300 text-sm leading-relaxed">{description}</p>

        {/* Bottom Border Animation */}
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
          initial={{ width: 0 }}
          animate={isHovered ? { width: '100%' } : { width: 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
};
