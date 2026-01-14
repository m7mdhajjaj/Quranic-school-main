// ============================================================================
// WelcomePage.tsx - صفحة الترحيب الرئيسية
// ============================================================================
// الصفحة منظمة ومقسمة إلى components منفصلة
// ============================================================================

import { motion } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa';
import { useWelcomePage } from './useWelcomePage';
import VideoUploadButton from './VideoUploadButton';
import {
  AnimatedBackground,
  AnimatedLogo,
  FeatureCard,
  CTAButton,
  StatsSection,
  ScrollIndicator,
} from './components';

// ============================================================================
// Main Welcome Page Component
// ============================================================================
const WelcomePage = () => {
  const {
    features,
    stats,
    particles,
    floatingShapes,
    shootingStars,
    videoUrl,
    fallbackVideoUrl,
    handleLoginClick,
    handleHomeClick,
    handleScrollDown,
  } = useWelcomePage();

  return (
    <div className="relative min-h-screen overflow-hidden bg-emerald-950" dir="rtl">
      {/* Animated Background */}
      <AnimatedBackground 
        floatingShapes={floatingShapes}
        particles={particles}
        shootingStars={shootingStars}
        videoUrl={videoUrl}
        fallbackVideoUrl={fallbackVideoUrl}
      />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16">
        {/* Animated Logo */}
        <AnimatedLogo />

        {/* Welcome Text */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Main Title with Gradient Animation */}
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
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
            className="text-2xl md:text-4xl text-emerald-200 mb-6 font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            في{' '}
            <span className="font-bold text-white">أكاديمية المهاجرين</span>
            {' '}القرآنية
          </motion.h2>

          <motion.p
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            منصة تعليمية متكاملة لتعلم القرآن الكريم وتحفيظه،
            مع نظام متابعة شامل للطلاب والمعلمين
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12 px-4">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <CTAButton
            onClick={handleLoginClick}
            primary
            icon={<FaArrowLeft />}
          >
            تسجيل الدخول
          </CTAButton>

          <CTAButton
            onClick={handleHomeClick}
            delay={0.1}
          >
            تصفح الموقع
          </CTAButton>
        </div>

        {/* Stats Section */}
        <StatsSection stats={stats} />

        {/* Decorative Quran Verse */}
        <motion.div
          className="mt-16 text-center relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <motion.div
            className="absolute -inset-4 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent rounded-full blur-xl"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <p className="text-emerald-300/80 text-2xl md:text-3xl font-arabic leading-loose relative z-10">
            ﴿ وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا ﴾
          </p>
          <p className="text-gray-500 text-sm mt-3">سورة المزمل - آية 4</p>
        </motion.div>

        {/* Scroll Indicator */}
        <ScrollIndicator onScrollDown={handleScrollDown} />
      </div>

      {/* Animated Wave at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="rgba(255,255,255,0.03)"
          />
        </svg>
      </div>

      {/* زر رفع الفيديو للأدمن */}
      <VideoUploadButton />
    </div>
  );
};

export default WelcomePage;
