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
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2 }}
      onClick={onScrollDown}
    >
      <span className="text-white/50 text-sm">اكتشف المزيد</span>
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <ChevronDown className="w-6 h-6 text-white/50" />
      </motion.div>
    </motion.div>
  );
};
