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
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Main Title with Gradient Animation */}
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.span 
              className="inline-block bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{ backgroundSize: '200% 200%' }}
            >
              أهلاً وسهلاً
            </motion.span>
          </motion.h1>

          <motion.h2
            className="text-xl md:text-3xl text-emerald-200 mb-4 font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            في{' '}
            <span className="font-bold text-white">أكاديمية المهاجرين</span>
            {' '}القرآنية
          </motion.h2>

          <motion.p
            className="text-gray-300 text-base md:text-lg max-w-xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            منصة تعليمية متكاملة لتعلم القرآن الكريم وتحفيظه
          </motion.p>
        </motion.div>

        {/* CTA Button - تسجيل الدخول فقط */}
        <motion.div 
          className="mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
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
