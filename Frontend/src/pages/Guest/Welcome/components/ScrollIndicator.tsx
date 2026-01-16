// ============================================================================
// ScrollIndicator.tsx - مؤشر التمرير
// ============================================================================

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface ScrollIndicatorProps {
  onScrollDown: () => void;
}

export const ScrollIndicator = ({ onScrollDown }: ScrollIndicatorProps) => {
  return (
    <motion.div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.4 }}
      onClick={onScrollDown}
    >
      <span className="text-white/50 text-sm group-hover:text-white/70 transition-colors">اكتشف المزيد</span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown className="w-6 h-6 text-white/50 group-hover:text-white/70 transition-colors" />
      </motion.div>
    </motion.div>
  );
};
