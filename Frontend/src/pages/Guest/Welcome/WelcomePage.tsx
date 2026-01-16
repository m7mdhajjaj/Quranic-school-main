// ============================================================================
// WelcomePage.tsx - صفحة الترحيب الرئيسية
// ============================================================================
// الصفحة منظمة ومقسمة إلى components منفصلة
// ============================================================================

import { motion } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa';
import { useWelcomePage } from './Hooks/useWelcomePage';
import VideoUploadButton from './components/VideoUploadButton';
import {
  AnimatedBackground,
  AnimatedLogo,
  CTAButton,
  ScrollIndicator,
} from './components';

// ============================================================================
// Main Welcome Page Component
// ============================================================================
const WelcomePage = () => {
  const {
    videoUrl,
    fallbackVideoUrl,
    handleLoginClick,
    handleHomeClick,
  } = useWelcomePage();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-emerald-950" dir="rtl">
      {/* Animated Background - Video */}
      <AnimatedBackground 
        videoUrl={videoUrl}
        fallbackVideoUrl={fallbackVideoUrl}
      />

      {/* Main Content - Centered */}
      <div className="relative z-10 h-full w-full flex flex-col items-center justify-center px-4">
        {/* Animated Logo */}
        <AnimatedLogo />

        {/* Welcome Text */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Main Title with Gradient - مبسط للأداء */}
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <span className="inline-block bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
              أهلاً وسهلاً
            </span>
          </motion.h1>

          <motion.h2
            className="text-xl md:text-3xl text-emerald-200 mb-4 font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            في{' '}
            <span className="font-bold text-white">أكاديمية المهاجرين</span>
            {' '}القرآنية
          </motion.h2>

          <motion.p
            className="text-gray-300 text-base md:text-lg max-w-xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            منصة تعليمية متكاملة لتعلم القرآن الكريم وتحفيظه
          </motion.p>
        </motion.div>

        {/* CTA Button - تسجيل الدخول فقط */}
        <motion.div 
          className="mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.4 }}
        >
          <CTAButton
            onClick={handleLoginClick}
            primary
            icon={<FaArrowLeft />}
          >
            تسجيل الدخول
          </CTAButton>
        </motion.div>

        {/* اكتشف المزيد - يوديك لصفحة التصفح */}
        <ScrollIndicator onScrollDown={handleHomeClick} />
      </div>

      {/* زر رفع الفيديو للأدمن */}
      <VideoUploadButton />
    </div>
  );
};

export default WelcomePage;
