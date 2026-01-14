// ============================================================================
// WelcomePage.tsx - صفحة الترحيب المحسّنة
// ============================================================================
// صفحة ترحيبية مذهلة مع animations متقدمة
// ============================================================================

import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FaQuran, 
  FaGraduationCap, 
  FaMosque, 
  FaStar, 
  FaArrowLeft,
  FaUsers,
  FaBook
} from 'react-icons/fa';
import { useMemo, useState } from 'react';
import { Sparkles, Award, ChevronDown } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

interface FloatingShape {
  id: number;
  type: 'circle' | 'star' | 'diamond';
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

// ============================================================================
// Generate Particles - خارج الكومبوننت لتجنب إعادة التوليد
// ============================================================================
const generateParticles = (count: number): Particle[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2,
  }));
};

const generateFloatingShapes = (count: number): FloatingShape[] => {
  const types: ('circle' | 'star' | 'diamond')[] = ['circle', 'star', 'diamond'];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    type: types[Math.floor(Math.random() * types.length)],
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 30 + 15,
    duration: Math.random() * 10 + 15,
    delay: Math.random() * 5,
  }));
};

// Pre-generate particles and shapes
const PARTICLES = generateParticles(50);
const FLOATING_SHAPES = generateFloatingShapes(15);
const SHOOTING_STARS_POSITIONS = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  top: 10 + i * 15,
  delay: i * 4 + Math.random() * 3,
}));

// Cloudinary Video URL
const CLOUDINARY_VIDEO_URL = 'https://res.cloudinary.com/dfi5r4ssx/video/upload/v1/quranic-school/QuestPage/Quest_fgcfvr.mp4';

// ============================================================================
// Animated Background Component - محسّن
// ============================================================================
const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={CLOUDINARY_VIDEO_URL} type="video/mp4" />
      </video>

      {/* Dark Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/80 via-teal-900/70 to-cyan-950/80" />
      
      {/* Animated Gradient Overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-emerald-800/30 via-transparent to-teal-800/30"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Aurora Effect */}
      <motion.div
        className="absolute -top-1/2 -left-1/4 w-[150%] h-[150%]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
        }}
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 60, repeat: Infinity, ease: 'linear' },
          scale: { duration: 10, repeat: Infinity, ease: 'easeInOut' },
        }}
      />

      {/* Large Animated Orbs */}
      <motion.div
        className="absolute top-10 left-10 w-[500px] h-[500px] bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-gradient-to-tl from-teal-500/20 to-transparent rounded-full blur-3xl"
        animate={{
          x: [0, -80, 0],
          y: [0, -60, 0],
          scale: [1.2, 1, 1.2],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-500/10 via-emerald-500/10 to-teal-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.15, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Floating Shapes */}
      {FLOATING_SHAPES.map((shape) => (
        <motion.div
          key={shape.id}
          className="absolute"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: shape.size,
            height: shape.size,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            rotate: [0, 360],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            delay: shape.delay,
            ease: 'easeInOut',
          }}
        >
          {shape.type === 'circle' && (
            <div className="w-full h-full rounded-full border border-white/10" />
          )}
          {shape.type === 'star' && (
            <Sparkles className="w-full h-full text-white/10" />
          )}
          {shape.type === 'diamond' && (
            <div className="w-full h-full rotate-45 border border-white/10" />
          )}
        </motion.div>
      ))}

      {/* Particles */}
      {PARTICLES.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0, 1.5, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Shooting Stars */}
      {SHOOTING_STARS_POSITIONS.map((star) => (
        <motion.div
          key={`shooting-${star.id}`}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            top: `${star.top}%`,
            right: '-5%',
          }}
          animate={{
            x: [0, -2000],
            y: [0, 500],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: star.delay,
            ease: 'easeOut',
          }}
        >
          <div className="absolute inset-0 w-20 h-0.5 bg-gradient-to-l from-white to-transparent -translate-x-full" />
        </motion.div>
      ))}

      {/* Islamic Geometric Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1'%3E%3Cpath d='M0 0h80v80H0z'/%3E%3Cpath d='M40 0v80M0 40h80M20 0v80M60 0v80M0 20h80M0 60h80'/%3E%3Ccircle cx='40' cy='40' r='20'/%3E%3Ccircle cx='40' cy='40' r='10'/%3E%3Cpath d='M20 20h40v40H20z' transform='rotate(45 40 40)'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
    </div>
  );
};

// ============================================================================
// Animated Logo Component
// ============================================================================
const AnimatedLogo = () => {
  return (
    <motion.div
      className="relative mb-10"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 200, 
        damping: 15,
        delay: 0.2 
      }}
    >
      {/* Outer Glow Rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full"
          style={{
            border: `${2 - i * 0.5}px solid rgba(16, 185, 129, ${0.3 - i * 0.1})`,
            transform: `scale(${1 + i * 0.2})`,
          }}
          animate={{
            scale: [1 + i * 0.2, 1.4 + i * 0.2, 1 + i * 0.2],
            opacity: [0.3 - i * 0.1, 0, 0.3 - i * 0.1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Main Logo Container */}
      <motion.div
        className="relative w-36 h-36 md:w-44 md:h-44"
        whileHover={{ scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {/* Rotating Border */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, #10b981, #14b8a6, #06b6d4, #10b981)',
            padding: 3,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-900 to-teal-900" />
        </motion.div>

        {/* Inner Circle with Icon */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-2xl overflow-hidden">
          {/* Shimmer Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
          <FaQuran className="text-5xl md:text-6xl text-white relative z-10 drop-shadow-lg" />
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// Feature Card Component - محسّن
// ============================================================================
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

const FeatureCard = ({ icon, title, description, index }: FeatureCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative group cursor-pointer"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: 0.5 + index * 0.1,
        type: 'spring',
        stiffness: 100 
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -10 }}
    >
      {/* Card Glow */}
      <motion.div
        className="absolute -inset-1 bg-gradient-to-r from-emerald-500/50 via-teal-500/50 to-cyan-500/50 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        animate={isHovered ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      />

      {/* Card Content */}
      <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 overflow-hidden">
        {/* Animated Background Gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 opacity-0 group-hover:opacity-100"
          transition={{ duration: 0.3 }}
        />

        {/* Corner Decorations */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-500/20 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-teal-500/20 to-transparent rounded-tr-full" />

        {/* Icon Container */}
        <motion.div
          className="relative w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mb-4 overflow-hidden"
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={isHovered ? { x: ['-100%', '100%'] } : {}}
            transition={{ duration: 0.6 }}
          />
          <span className="text-3xl text-emerald-400 relative z-10">{icon}</span>
        </motion.div>

        {/* Text Content */}
        <h3 className="text-xl font-bold text-white mb-2 relative z-10">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed relative z-10">{description}</p>

        {/* Bottom Line Animation */}
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
          initial={{ width: 0 }}
          animate={isHovered ? { width: '100%' } : { width: 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
};

// ============================================================================
// Animated CTA Button
// ============================================================================
interface CTAButtonProps {
  onClick: () => void;
  primary?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  delay?: number;
}

const CTAButton = ({ onClick, primary = false, children, icon, delay = 0 }: CTAButtonProps) => {
  return (
    <motion.button
      onClick={onClick}
      className={`relative group px-10 py-5 font-bold text-lg rounded-2xl overflow-hidden ${
        primary
          ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30'
          : 'bg-white/10 backdrop-blur-md text-white border border-white/20'
      }`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.2 + delay }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Shimmer Effect for Primary */}
      {primary && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />
      )}

      {/* Hover Glow */}
      <motion.div
        className={`absolute inset-0 ${
          primary 
            ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400' 
            : 'bg-white/20'
        } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      {/* Button Content */}
      <span className="relative z-10 flex items-center justify-center gap-3">
        {children}
        {icon && (
          <motion.span
            className="inline-block"
            animate={{ x: [0, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {icon}
          </motion.span>
        )}
      </span>

      {/* Particle Effect on Hover */}
      <AnimatePresence>
        {primary && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${10 + i * 10}%`,
                  bottom: 0,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// ============================================================================
// Stats Counter Component
// ============================================================================
const STATS = [
  { icon: <FaUsers />, number: '500+', label: 'طالب وطالبة' },
  { icon: <FaBook />, number: '30+', label: 'حلقة قرآنية' },
  { icon: <FaGraduationCap />, number: '50+', label: 'معلم متميز' },
  { icon: <Award />, number: '100+', label: 'خريج' },
];

const StatsSection = () => {
  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto mt-16 px-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5 }}
    >
      {STATS.map((stat, index) => (
        <motion.div
          key={index}
          className="text-center p-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.6 + index * 0.1 }}
          whileHover={{ scale: 1.1 }}
        >
          <motion.div 
            className="text-3xl text-emerald-400 mb-2 flex justify-center"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
          >
            {stat.icon}
          </motion.div>
          <motion.div 
            className="text-3xl md:text-4xl font-bold text-white mb-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 + index * 0.1 }}
          >
            {stat.number}
          </motion.div>
          <div className="text-gray-400 text-sm">{stat.label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
};

// ============================================================================
// Scroll Indicator
// ============================================================================
const ScrollIndicator = () => {
  return (
    <motion.div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2 }}
      onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
    >
      <span className="text-white/50 text-sm">اكتشف المزيد</span>
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <ChevronDown className="w-6 h-6 text-white/50" />
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// Main Welcome Page Component
// ============================================================================
const WelcomePage = () => {
  const navigate = useNavigate();

  const features = useMemo(() => [
    {
      icon: <FaQuran />,
      title: 'تعلم القرآن',
      description: 'نظام متكامل لحفظ وتلاوة القرآن الكريم مع متابعة دقيقة',
    },
    {
      icon: <FaGraduationCap />,
      title: 'تقييم مستمر',
      description: 'اختبارات وتقييمات دورية لقياس مستوى التقدم',
    },
    {
      icon: <FaMosque />,
      title: 'بيئة إسلامية',
      description: 'مواقيت الصلاة والأذكار اليومية في مكان واحد',
    },
    {
      icon: <FaStar />,
      title: 'نظام المكافآت',
      description: 'نقاط وجوائز تحفيزية لتشجيع الطلاب على التميز',
    },
  ], []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-emerald-950" dir="rtl">
      {/* Animated Background */}
      <AnimatedBackground />

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
            onClick={() => navigate('/login')}
            primary
            icon={<FaArrowLeft />}
          >
            تسجيل الدخول
          </CTAButton>

          <CTAButton
            onClick={() => navigate('/home')}
            delay={0.1}
          >
            تصفح الموقع
          </CTAButton>
        </div>

        {/* Stats Section */}
        <StatsSection />

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
        <ScrollIndicator />
      </div>

      {/* Animated Wave at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
        <motion.svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="rgba(255,255,255,0.03)"
            animate={{
              d: [
                "M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z",
                "M0 120L60 90C120 75 240 45 360 52.5C480 60 600 75 720 67.5C840 60 960 45 1080 52.5C1200 60 1320 90 1380 105L1440 120V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z",
                "M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z",
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.svg>
      </div>
    </div>
  );
};

export default WelcomePage;
