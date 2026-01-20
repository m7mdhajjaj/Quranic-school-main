// components/AnimatedBackground.tsx
import { motion } from "framer-motion";

interface AnimatedBackgroundProps {
  variant?: "teal" | "emerald" | "blue" | "purple";
}

export const AnimatedBackground = ({ variant = "teal" }: AnimatedBackgroundProps) => {
  const gradients = {
    teal: {
      from: "from-emerald-600",
      via: "via-teal-700",
      to: "to-slate-700",
      orb1: "bg-teal-400/30",
      orb2: "bg-emerald-300/20",
      orb3: "bg-slate-400/25",
    },
    emerald: {
      from: "from-emerald-600",
      via: "via-teal-700",
      to: "to-slate-700",
      orb1: "bg-emerald-400/30",
      orb2: "bg-teal-300/20",
      orb3: "bg-slate-400/25",
    },
    blue: {
      from: "from-blue-600",
      via: "via-indigo-500",
      to: "to-purple-500",
      orb1: "bg-blue-400/30",
      orb2: "bg-indigo-300/20",
      orb3: "bg-purple-400/25",
    },
    purple: {
      from: "from-purple-600",
      via: "via-pink-500",
      to: "to-rose-500",
      orb1: "bg-purple-400/30",
      orb2: "bg-pink-300/20",
      orb3: "bg-rose-400/25",
    },
  };

  const colors = gradients[variant];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Base */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.from} ${colors.via} ${colors.to}`} />
      
      {/* Animated Orbs */}
      <motion.div
        className={`absolute -top-40 -right-40 w-96 h-96 ${colors.orb1} rounded-full blur-3xl`}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className={`absolute top-1/2 -left-20 w-72 h-72 ${colors.orb2} rounded-full blur-3xl`}
        animate={{
          x: [0, -30, 0],
          y: [0, 50, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      
      <motion.div
        className={`absolute -bottom-20 right-1/3 w-80 h-80 ${colors.orb3} rounded-full blur-3xl`}
        animate={{
          x: [0, 40, 0],
          y: [0, -40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Floating Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/10" />
    </div>
  );
};
