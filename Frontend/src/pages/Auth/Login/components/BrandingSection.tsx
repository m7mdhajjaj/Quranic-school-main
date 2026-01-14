import { motion } from "framer-motion";
import { Logo } from "@/components/UI";

// ============================================================================
// Types
// ============================================================================
interface BrandingSectionProps {
  logoUrl: string;
  logoLoading: boolean;
}

// ============================================================================
// Feature Tags Data
// ============================================================================
const FEATURE_TAGS = ["متابعة الحفظ", "التقارير", "الحضور"];

// ============================================================================
// Branding Section Component - قسم العلامة التجارية
// ============================================================================
export const BrandingSection = ({ logoUrl, logoLoading }: BrandingSectionProps) => (
  <motion.div
    className="flex-1 flex flex-col items-center justify-center lg:items-start lg:pr-8"
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.7, delay: 0.1 }}
  >
    {/* Logo */}
    <LogoSection logoUrl={logoUrl} logoLoading={logoLoading} />
    
    {/* Title & Content */}
    <TitleSection />
  </motion.div>
);

// ============================================================================
// Logo Section - قسم الشعار
// ============================================================================
const LogoSection = ({ logoUrl, logoLoading }: BrandingSectionProps) => (
  <motion.div
    className="relative mb-4"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.7, delay: 0.1, type: "spring" }}
  >
    {/* Glow Effect */}
    <motion.div
      className="absolute inset-0 -m-6 rounded-full"
      style={{
        background: "radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, rgba(20, 184, 166, 0.2) 50%, transparent 70%)",
        filter: "blur(20px)",
      }}
      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    />
    
    {/* Logo */}
    <motion.div
      animate={{ y: [-2, 2, -2] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <Logo
        logoUrl={logoUrl}
        logoLoading={logoLoading}
        size="lg"
        alt="مدرسة القرآن"
        showGlow={false}
      />
    </motion.div>
  </motion.div>
);

// ============================================================================
// Title Section - قسم العنوان
// ============================================================================
const TitleSection = () => (
  <motion.div
    className="text-center lg:text-right"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.3 }}
  >
    {/* 3D Title */}
    <Title3D />
    
    {/* Subtitle */}
    <Subtitle />
    
    {/* Decorative Line */}
    <DecorativeLine />
    
    {/* Description */}
    <Description />
    
    {/* Feature Tags */}
    <FeatureTags />
  </motion.div>
);

// ============================================================================
// 3D Title Component - عنوان ثلاثي الأبعاد
// ============================================================================
const Title3D = () => {
  const shadowLayers = [
    { opacity: 0.1, offset: "4px" },
    { opacity: 0.15, offset: "2px" },
    { opacity: 0.25, offset: "1px" },
  ];

  return (
    <div className="relative">
      {/* Shadow Layers */}
      {shadowLayers.map((layer, i) => (
        <motion.h1
          key={i}
          className="text-xl sm:text-3xl lg:text-5xl font-black absolute"
          style={{
            color: `rgba(16, 185, 129, ${layer.opacity})`,
            transform: `translate(${layer.offset}, ${layer.offset})`,
          }}
        >
          مدرسة القرآن
        </motion.h1>
      ))}
      
      {/* Main Text */}
      <motion.h1
        className="text-xl sm:text-3xl lg:text-5xl font-black relative"
        style={{
          background: "linear-gradient(135deg, #059669 0%, #10b981 30%, #0d9488 60%, #0891b2 100%)",
          backgroundSize: "300% 300%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          textShadow: "0 0 30px rgba(16, 185, 129, 0.3)",
        }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        مدرسة القرآن
      </motion.h1>
    </div>
  );
};

// ============================================================================
// Subtitle - العنوان الفرعي
// ============================================================================
const Subtitle = () => (
  <motion.h2
    className="text-base sm:text-xl lg:text-3xl font-bold text-emerald-700/80 mt-1"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.5 }}
  >
    الكريم
  </motion.h2>
);

// ============================================================================
// Decorative Line - خط زخرفي
// ============================================================================
const DecorativeLine = () => (
  <motion.div
    className="flex items-center gap-1 mt-2 justify-center lg:justify-start"
    initial={{ opacity: 0, scaleX: 0 }}
    animate={{ opacity: 1, scaleX: 1 }}
    transition={{ duration: 0.5, delay: 0.6 }}
  >
    <motion.div
      className="w-8 h-[1.5px] rounded-full bg-gradient-to-r from-transparent to-emerald-400"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <motion.div
      className="w-1.5 h-1.5 rounded-full bg-emerald-400"
      animate={{ scale: [1, 1.3, 1] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
    <motion.div
      className="w-8 h-[1.5px] rounded-full bg-gradient-to-l from-transparent to-teal-400"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
    />
  </motion.div>
);

// ============================================================================
// Description - الوصف
// ============================================================================
const Description = () => (
  <motion.p
    className="text-emerald-600/60 text-xs sm:text-sm mt-2 font-medium"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.7 }}
  >
    ✨ نظام إدارة الطلاب المتكامل ✨
  </motion.p>
);

// ============================================================================
// Feature Tags - تاغات المميزات
// ============================================================================
const FeatureTags = () => (
  <motion.div
    className="flex flex-wrap gap-2 sm:gap-3 mt-3 justify-center lg:justify-start"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.8 }}
  >
    {FEATURE_TAGS.map((tag, i) => (
      <motion.span
        key={tag}
        className="text-xs sm:text-sm px-4 py-1.5 rounded-full bg-emerald-100/60 text-emerald-700/80 border border-emerald-300/40 font-medium shadow-sm"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9 + i * 0.1 }}
        whileHover={{
          scale: 1.08,
          backgroundColor: "rgba(16, 185, 129, 0.25)",
          boxShadow: "0 4px 15px rgba(16, 185, 129, 0.2)",
        }}
      >
        {tag}
      </motion.span>
    ))}
  </motion.div>
);

// ============================================================================
// Vertical Divider - فاصل عمودي
// ============================================================================
export const VerticalDivider = () => (
  <motion.div
    className="hidden lg:flex items-center justify-center px-6"
    initial={{ opacity: 0, scaleY: 0 }}
    animate={{ opacity: 1, scaleY: 1 }}
    transition={{ duration: 0.5, delay: 0.4 }}
  >
    <div className="relative h-80">
      <div className="absolute inset-0 w-[2px] bg-gradient-to-b from-transparent via-emerald-300/50 to-transparent" />
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-emerald-400"
        animate={{
          scale: [1, 1.3, 1],
          boxShadow: [
            "0 0 10px rgba(16, 185, 129, 0.5)",
            "0 0 20px rgba(16, 185, 129, 0.8)",
            "0 0 10px rgba(16, 185, 129, 0.5)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  </motion.div>
);
