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
// Click Ripples Component - تأثير الموجة عند الضغط
// ============================================================================
export const ClickRipples = ({ ripples }: ClickRipplesProps) => (
  <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
    <AnimatePresence>
      {ripples.map((ripple) => (
        <motion.div
          key={ripple.id}
          className="absolute"
          style={{ left: ripple.x, top: ripple.y }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 1, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Main Ripple Circle */}
          <motion.div
            className="absolute -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(20, 184, 166, 0.2) 40%, transparent 70%)",
            }}
          />
          
          {/* Inner Glow */}
          <motion.div
            className="absolute -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(52, 211, 153, 0.6) 0%, transparent 60%)",
              filter: "blur(10px)",
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          
          {/* Sparkle Burst */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400"
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0],
                x: Math.cos((i * Math.PI * 2) / 8) * 80,
                y: Math.sin((i * Math.PI * 2) / 8) * 80,
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.02 }}
              style={{ boxShadow: "0 0 10px rgba(16, 185, 129, 0.8)" }}
            />
          ))}
          
          {/* Ring Expansion */}
          <motion.div
            className="absolute -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] rounded-full border-2 border-emerald-400/50"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);
