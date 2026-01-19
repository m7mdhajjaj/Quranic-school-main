import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

// ============================================================================
// Aurora Effect - شفق قطبي متحرك
// ============================================================================
export const AuroraEffect = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      className="absolute -top-1/2 -left-1/2 w-full h-full"
      style={{
        background: "radial-gradient(ellipse at center, rgba(16, 185, 129, 0.15) 0%, transparent 70%)",
      }}
      animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    />
    <motion.div
      className="absolute -bottom-1/2 -right-1/2 w-full h-full"
      style={{
        background: "radial-gradient(ellipse at center, rgba(20, 184, 166, 0.12) 0%, transparent 70%)",
      }}
      animate={{ rotate: [360, 0], scale: [1.2, 1, 1.2] }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

// ============================================================================
// Mesh Gradient - شبكة متدرجة (مخففة للأداء)
// ============================================================================
export const MeshGradient = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
    <motion.div
      className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full"
      style={{
        background: "radial-gradient(circle, rgba(52, 211, 153, 0.2) 0%, transparent 70%)",
        // filter: "blur(60px)", // Removed heavy blur
      }}
      animate={{ x: [0, 50, 0], y: [0, 30, 0] }} // Reduced movement range
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full"
      style={{
        background: "radial-gradient(circle, rgba(45, 212, 191, 0.15) 0%, transparent 70%)",
        // filter: "blur(50px)", // Removed heavy blur
      }}
      animate={{ x: [0, -40, 0], y: [0, -30, 0] }} // Reduced movement range
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

// ============================================================================
// Floating Orbs - كرات عائمة
// ============================================================================
const ORBS_CONFIG = [
  { size: 8, x: 15, y: 20, delay: 0 },
  { size: 6, x: 85, y: 15, delay: 1 },
  { size: 10, x: 75, y: 80, delay: 2 },
  { size: 5, x: 20, y: 75, delay: 0.5 },
  { size: 7, x: 50, y: 10, delay: 1.5 },
  { size: 4, x: 90, y: 50, delay: 2.5 },
  { size: 6, x: 10, y: 50, delay: 3 },
];

export const FloatingOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {ORBS_CONFIG.map((orb, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-gradient-to-br from-emerald-400/50 to-teal-400/30"
        style={{
          width: orb.size,
          height: orb.size,
          left: `${orb.x}%`,
          top: `${orb.y}%`,
          boxShadow: "0 0 10px rgba(16, 185, 129, 0.4)",
        }}
        animate={{ y: [-30, 30, -30], x: [-15, 15, -15], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 6 + i, delay: orb.delay, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
  </div>
);

// ============================================================================
// Geometric Pattern - نمط هندسي
// ============================================================================
export const GeometricPattern = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
    <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <circle
            cx="30"
            cy="30"
            r="1.5"
            fill="#10b981"
            opacity="0.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  </div>
);

// ============================================================================
// Sparkle Effects - تأثيرات اللمعان
// ============================================================================
export const SparkleEffects = () => (
  <>
    <motion.div
      className="absolute top-20 right-20 text-emerald-400/60"
      animate={{ rotate: [0, 180, 360], scale: [1, 1.2, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <Sparkles className="w-6 h-6" />
    </motion.div>
    <motion.div
      className="absolute bottom-32 left-16 text-teal-400/50"
      animate={{ rotate: [360, 180, 0], scale: [1.2, 1, 1.2] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
    >
      <Sparkles className="w-5 h-5" />
    </motion.div>
    <motion.div
      className="absolute top-1/3 left-10 text-emerald-300/40"
      animate={{ rotate: [0, -180, -360], scale: [1, 1.3, 1] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
    >
      <Sparkles className="w-4 h-4" />
    </motion.div>
  </>
);

// ============================================================================
// Combined Background - خلفية متكاملة
// ============================================================================
export const AnimatedBackground = () => (
  <>
    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50/50" />
    <AuroraEffect />
    <MeshGradient />
    <FloatingOrbs />
    <GeometricPattern />
    <SparkleEffects />
    <div className="absolute inset-0 backdrop-blur-[0.5px]" />
  </>
);
