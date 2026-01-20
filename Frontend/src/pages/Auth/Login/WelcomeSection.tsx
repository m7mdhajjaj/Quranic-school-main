import React, { useContext } from "react";
import { motion } from "framer-motion";
import { Logo, Badge, FeatureList } from "@/components/UI";
import { Star, BookOpen, BarChart, FileText, Sparkles } from "lucide-react";

// Context to share tilt between LoginCard and WelcomeSection
const TiltContext = React.createContext<{ x: number; y: number }>({ x: 0, y: 0 });

interface WelcomeSectionProps {
  logoUrl: string | null;
  logoLoading: boolean;
}

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

const floatVariants = {
  animate: {
    y: [-5, 5, -5],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  logoUrl,
  logoLoading,
}) => {
  // Consume tilt from context if available
  const tilt = useContext(TiltContext);
  return (
    <motion.div
      className="w-full lg:w-1/2 flex flex-col items-center lg:items-start justify-center text-center lg:text-right order-1 lg:order-2 px-4 lg:px-6 relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Decorative Floating Elements */}
      <motion.div
        className="absolute top-10 right-10 hidden lg:block"
        variants={floatVariants}
        animate="animate"
      >
        <Sparkles className="w-8 h-8 text-emerald-400/60" />
      </motion.div>
      <motion.div
        className="absolute bottom-20 left-5 hidden lg:block"
        variants={floatVariants}
        animate="animate"
        transition={{ delay: 1 }}
      >
        <Sparkles className="w-6 h-6 text-teal-400/50" />
      </motion.div>

      {/* Logo - with floating animation */}
      <motion.div 
        className="mb-6 lg:mb-8 relative"
        variants={itemVariants}
      >
        <motion.div
          animate={{
            y: [-2, 2, -2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Logo
            logoUrl={logoUrl}
            logoLoading={logoLoading}
            size="md"
            alt="مدرسة القرآن"
            showGlow={true}
          />
        </motion.div>
        {/* Logo Glow Ring */}
        <motion.div
          className="absolute inset-0 -m-4 rounded-full bg-gradient-to-r from-emerald-400/20 to-teal-400/20 blur-xl -z-10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Title and Description */}
      <div className="space-y-4 max-w-xl w-full">
        {/* Main Title */}
        <motion.div className="space-y-2" variants={itemVariants}>
          <motion.h1 
            className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 bg-clip-text text-transparent drop-shadow-lg leading-tight"
            animate={{
              backgroundPosition: ["0%", "100%", "0%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              backgroundSize: "200% 200%",
            }}
          >
            مدرسة القرآن الكريم
          </motion.h1>

          <motion.p 
            className="text-base sm:text-lg lg:text-xl text-emerald-700/90 font-semibold"
            variants={itemVariants}
          >
            نظام إدارة الطلاب المتكامل
          </motion.p>
        </motion.div>

        {/* Badge with hover effect */}
        <motion.div 
          className="flex justify-center lg:justify-start pt-1"
          variants={itemVariants}
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Badge
              variant="primary"
              size="sm"
              icon={<Star className="w-3 h-3" fill="currentColor" />}
              className="text-teal-700 bg-teal-50 border-teal-200 shadow-sm cursor-pointer text-xs"
            >
              منصة تعليمية متميزة
            </Badge>
          </motion.div>
        </motion.div>

        {/* Animated Divider */}
        <motion.div 
          className="hidden lg:flex items-center gap-2"
          variants={itemVariants}
        >
          <motion.div
            className="h-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 64 }}
            transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
          />
          <motion.div
            className="w-2 h-2 rounded-full bg-teal-400"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 1.5 }}
          />
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-emerald-300"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 1.7 }}
          />
        </motion.div>

        {/* Features List with staggered animation */}
        <motion.div 
          className="pt-3"
          variants={itemVariants}
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.2,
                  delayChildren: 0.8,
                },
              },
            }}
          >
            <FeatureList
              align="start"
              variant="default"
              spacing="normal"
              items={[
                {
                  icon: (
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.2 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <BookOpen className="w-4 h-4" />
                    </motion.div>
                  ),
                  text: "إدارة شاملة للطلاب والمعلمين",
                },
                {
                  icon: (
                    <motion.div
                      whileHover={{ rotate: -10, scale: 1.2 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <BarChart className="w-4 h-4" />
                    </motion.div>
                  ),
                  text: "تتبع الحضور والأداء الأكاديمي",
                },
                {
                  icon: (
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.2 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <FileText className="w-4 h-4" />
                    </motion.div>
                  ),
                  text: "تقارير تفصيلية ومتابعة دقيقة",
                },
              ]}
            />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};
