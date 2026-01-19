import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// Types
// ============================================================================
export interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface ClickRipplesProps {
  ripples: Ripple[];
}

// ============================================================================
// Click Ripples Component - تأثير الموجة عند الضغط (مخفف للأداء)
// ============================================================================
export const ClickRipples = ({ ripples }: ClickRipplesProps) => (
  <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
    <AnimatePresence>
      {ripples.map((ripple) => (
        <motion.div
          key={ripple.id}
          className="absolute"
          style={{ left: ripple.x, top: ripple.y }}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 1.5, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Simple Ripple Circle - بديل خفيف للأداء */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] rounded-full border border-emerald-400/50 bg-emerald-400/10"
          />
          
          {/* Optional Second Ring */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 w-[60px] h-[60px] rounded-full border border-teal-400/30"
          />
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);
