import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import ForgotPasswordModal from "../ResetPassword/ForgotPasswordModal";
import { LoginForm } from "./LoginForm";
import { LoginCard } from "./LoginCard";
import { useLoginLogic } from "./hooks";
import { Logo } from "@/components/UI";
import { Sparkles } from "lucide-react";

// ============================================================================
// Click Ripple Effect - تأثير الموجة عند الضغط
// ============================================================================

interface Ripple {
  id: number;
  x: number;
  y: number;
}

const ClickRipples = ({ ripples }: { ripples: Ripple[] }) => {
  return (
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
                style={{
                  boxShadow: "0 0 10px rgba(16, 185, 129, 0.8)",
                }}
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
};

/** Hook for managing click ripples */
const useClickRipples = () => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const addRipple = useCallback((e: React.MouseEvent) => {
    const newRipple: Ripple = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
    };
    setRipples((prev) => [...prev, newRipple]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 1000);
  }, []);

  return { ripples, addRipple };
};

// ============================================================================
// Premium Animated Background
// ============================================================================

/** Aurora Effect - شفق قطبي متحرك */
const AuroraEffect = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-1/2 -left-1/2 w-full h-full"
        style={{
          background: "radial-gradient(ellipse at center, rgba(16, 185, 129, 0.15) 0%, transparent 70%)",
        }}
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute -bottom-1/2 -right-1/2 w-full h-full"
        style={{
          background: "radial-gradient(ellipse at center, rgba(20, 184, 166, 0.12) 0%, transparent 70%)",
        }}
        animate={{
          rotate: [360, 0],
          scale: [1.2, 1, 1.2],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
};

/** Mesh Gradient - شبكة متدرجة */
const MeshGradient = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
      <motion.div
        className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(52, 211, 153, 0.3) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{
          x: [0, 100, 50, 0],
          y: [0, 50, 100, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(45, 212, 191, 0.25) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
        animate={{
          x: [0, -80, -40, 0],
          y: [0, -60, -120, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};

/** Floating Orbs - كرات عائمة فاخرة */
const FloatingOrbs = () => {
  const orbs = [
    { size: 8, x: 15, y: 20, delay: 0 },
    { size: 6, x: 85, y: 15, delay: 1 },
    { size: 10, x: 75, y: 80, delay: 2 },
    { size: 5, x: 20, y: 75, delay: 0.5 },
    { size: 7, x: 50, y: 10, delay: 1.5 },
    { size: 4, x: 90, y: 50, delay: 2.5 },
    { size: 6, x: 10, y: 50, delay: 3 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map((orb, i) => (
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
          animate={{
            y: [-30, 30, -30],
            x: [-15, 15, -15],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 6 + i,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

/** Animated Pattern - نمط هندسي */
const GeometricPattern = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <motion.circle
              cx="30"
              cy="30"
              r="1"
              fill="#10b981"
              animate={{ r: [1, 2, 1], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
};

/** Sparkle Effects */
const SparkleEffects = () => {
  return (
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
};

// ============================================================================
// Main Login Component
// ============================================================================

const Login = () => {
  const {
    formData,
    error,
    isLoading,
    rememberMe,
    showForgotPasswordModal,
    setShowForgotPasswordModal,
    handleChange,
    handleSubmit,
    handleRememberMeChange,
    logoUrl,
    logoLoading,
  } = useLoginLogic();

  // Click ripple effect
  const { ripples, addRipple } = useClickRipples();

  return (
    <div
      className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center py-6 px-4"
      dir="rtl"
      onClick={addRipple}
    >
      {/* Click Ripples */}
      <ClickRipples ripples={ripples} />

      {/* Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50/50" />
      
      {/* Premium Background Effects */}
      <AuroraEffect />
      <MeshGradient />
      <FloatingOrbs />
      <GeometricPattern />
      <SparkleEffects />

      {/* Glass Overlay */}
      <div className="absolute inset-0 backdrop-blur-[0.5px]" />

      {/* Content */}
      <motion.div
        className="relative z-10 w-full max-w-sm flex flex-col items-center gap-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo with Glow */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, type: "spring" }}
        >
          {/* Logo Glow Ring */}
          <motion.div
            className="absolute inset-0 -m-4 rounded-full bg-gradient-to-r from-emerald-400/20 via-teal-400/20 to-emerald-400/20 blur-xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            animate={{ y: [-2, 2, -2] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Logo
              logoUrl={logoUrl}
              logoLoading={logoLoading}
              size="md"
              alt="مدرسة القرآن"
              showGlow={false}
            />
          </motion.div>
        </motion.div>

        {/* Title with Gradient Animation */}
        <motion.div
          className="text-center space-y-1"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.h1
            className="text-2xl sm:text-3xl font-bold"
            style={{
              background: "linear-gradient(135deg, #059669 0%, #0d9488 50%, #0891b2 100%)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            مدرسة القرآن الكريم
          </motion.h1>
          <motion.p
            className="text-emerald-600/70 text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            ✨ نظام إدارة الطلاب المتكامل ✨
          </motion.p>
        </motion.div>

        {/* Decorative Line */}
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.div
            className="w-8 h-[2px] rounded-full bg-gradient-to-r from-transparent to-emerald-400"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="w-2 h-2 rounded-full bg-emerald-400"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className="w-8 h-[2px] rounded-full bg-gradient-to-l from-transparent to-teal-400"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
        </motion.div>

        {/* Login Card */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 100 }}
        >
          <LoginCard error={error} success={!error && !isLoading && formData.userId && formData.password}>
            <LoginForm
              formData={formData}
              error={error}
              isLoading={isLoading}
              rememberMe={rememberMe}
              onFormChange={handleChange}
              onRememberMeChange={handleRememberMeChange}
              onSubmit={handleSubmit}
              onForgotPassword={() => setShowForgotPasswordModal(true)}
            />
          </LoginCard>
        </motion.div>

        {/* Bottom Badge */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.span
            className="inline-flex items-center gap-1 text-[10px] text-emerald-600/60 font-medium px-3 py-1 rounded-full bg-emerald-50/50 border border-emerald-200/30"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(16, 185, 129, 0.1)" }}
          >
            <Sparkles className="w-3 h-3" />
            منصة تعليمية متميزة
          </motion.span>
        </motion.div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPasswordModal && (
          <ForgotPasswordModal
            isOpen={showForgotPasswordModal}
            onClose={() => setShowForgotPasswordModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
