// ============================================================================
// StatsSection.tsx - قسم الإحصائيات
// ============================================================================

import { motion } from 'framer-motion';
import type { Stat } from '../useWelcomePage';

interface StatsSectionProps {
  stats: Stat[];
}

export const StatsSection = ({ stats }: StatsSectionProps) => {
  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto mt-16 px-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5 }}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          className="text-center p-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.6 + index * 0.1 }}
          whileHover={{ scale: 1.1 }}
        >
          <motion.div 
            className="text-3xl text-emerald-400 mb-2 flex justify-center"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
          >
            {stat.icon}
          </motion.div>
          <motion.div 
            className="text-3xl md:text-4xl font-bold text-white mb-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 + index * 0.1 }}
          >
            {stat.number}
          </motion.div>
          <div className="text-gray-400 text-sm">{stat.label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
};
