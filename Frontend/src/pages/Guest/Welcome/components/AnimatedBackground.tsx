// ============================================================================
// AnimatedBackground.tsx - الخلفية المتحركة
// ============================================================================

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { Particle, FloatingShape } from '../useWelcomePage';
import { useAnimatedBackground } from '../useAnimatedBackground';

interface AnimatedBackgroundProps {
  floatingShapes: FloatingShape[];
  particles: Particle[];
  shootingStars: { id: number; top: number; delay: number }[];
  videoUrl: string;
  fallbackVideoUrl: string;
}

export const AnimatedBackground = ({ 
  floatingShapes, 
  particles, 
  shootingStars, 
  videoUrl, 
  fallbackVideoUrl 
}: AnimatedBackgroundProps) => {
  const {
    videoError,
    currentVideoUrl,
    handleVideoError,
    handleVideoLoaded,
  } = useAnimatedBackground(videoUrl, fallbackVideoUrl);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Video Background */}
      {!videoError && (
        <video
          key={currentVideoUrl}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover z-0"
          onError={handleVideoError}
          onLoadedData={(e) => {
            handleVideoLoaded();
            const video = e.currentTarget;
            video.play().catch(handleVideoError);
          }}
        >
          <source src={currentVideoUrl} type="video/mp4" />
        </video>
      )}

      {/* Fallback gradient background if all videos fail */}
      {videoError && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-teal-900 to-cyan-950 z-0">
          {/* نمط هندسي إسلامي معقد كخلفية */}
          <div 
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1'%3E%3Ccircle cx='50' cy='50' r='40'/%3E%3Ccircle cx='50' cy='50' r='30'/%3E%3Ccircle cx='50' cy='50' r='20'/%3E%3Cline x1='50' y1='10' x2='50' y2='90'/%3E%3Cline x1='10' y1='50' x2='90' y2='50'/%3E%3Cline x1='20' y1='20' x2='80' y2='80'/%3E%3Cline x1='80' y1='20' x2='20' y2='80'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '100px 100px',
            }}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
          
          {/* آيات قرآنية متحركة */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-12 overflow-hidden">
            <motion.div
              className="text-emerald-300/25 text-7xl md:text-9xl font-arabic whitespace-nowrap font-bold"
              initial={{ x: '100%' }}
              animate={{ x: '-100%' }}
              transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
            >
              ﴿ وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا ﴾ • ﴿ إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ ﴾ • ﴿ وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ ﴾
            </motion.div>
            
            <motion.div
              className="text-teal-300/20 text-6xl md:text-8xl font-arabic whitespace-nowrap font-semibold"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 55, repeat: Infinity, ease: 'linear', delay: 1 }}
            >
              ﴿ اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ ﴾ • ﴿ الرَّحْمَٰنُ عَلَّمَ الْقُرْآنَ ﴾ • ﴿ شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ ﴾
            </motion.div>

            <motion.div
              className="text-cyan-300/15 text-5xl md:text-7xl font-arabic whitespace-nowrap"
              initial={{ x: '100%' }}
              animate={{ x: '-100%' }}
              transition={{ duration: 60, repeat: Infinity, ease: 'linear', delay: 2 }}
            >
              الله • الرحمن • الرحيم • الملك • القدوس • السلام • المؤمن • المهيمن • العزيز • الجبار • المتكبر • الخالق • البارئ • المصور
            </motion.div>

            <motion.div
              className="text-emerald-300/18 text-4xl md:text-6xl font-arabic whitespace-nowrap"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 65, repeat: Infinity, ease: 'linear', delay: 3 }}
            >
              ﴿ وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ ﴾ • ﴿ وَقُلْ رَبِّ زِدْنِي عِلْمًا ﴾ • ﴿ فَاذْكُرُونِي أَذْكُرْكُمْ ﴾
            </motion.div>

            <motion.div
              className="text-teal-300/22 text-3xl md:text-5xl font-arabic whitespace-nowrap font-light"
              initial={{ x: '100%' }}
              animate={{ x: '-100%' }}
              transition={{ duration: 70, repeat: Infinity, ease: 'linear', delay: 4 }}
            >
              سُبْحَانَ اللَّهِ • الْحَمْدُ لِلَّهِ • لَا إِلَٰهَ إِلَّا اللَّهُ • اللَّهُ أَكْبَرُ • لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ
            </motion.div>

            {/* نجوم متألقة */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                }}
              >
                <Sparkles className="w-4 h-4 text-white/40" />
              </motion.div>
            ))}

            {/* دوائر زخرفية */}
            {[...Array(7)].map((_, i) => (
              <motion.div
                key={`circle-${i}`}
                className="absolute border border-white/5 rounded-full"
                style={{
                  width: `${100 + i * 50}px`,
                  height: `${100 + i * 50}px`,
                  left: '50%',
                  top: '50%',
                  x: '-50%',
                  y: '-50%',
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.1, 0.05, 0.1],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20 + i * 5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            ))}

            {/* أهلة في الأركان */}
            {[
              { top: '10%', left: '10%' },
              { top: '10%', right: '10%' },
              { bottom: '10%', left: '10%' },
              { bottom: '10%', right: '10%' },
            ].map((pos, i) => (
              <motion.div
                key={`crescent-${i}`}
                className="absolute text-6xl text-white/10"
                style={pos}
                animate={{
                  opacity: [0.05, 0.15, 0.05],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  delay: i * 2,
                }}
              >
                ☪
              </motion.div>
            ))}

            {/* بسملة مركزية */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              animate={{
                opacity: [0, 0.3, 0],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
              }}
            >
              <div className="text-4xl md:text-6xl font-arabic text-white/20 whitespace-nowrap">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Dark Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/80 via-teal-900/70 to-cyan-950/80" />
      
      {/* Animated Gradient Overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-emerald-800/30 via-transparent to-teal-800/30"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
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
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      <motion.div
        className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-gradient-to-tl from-teal-500/20 to-transparent rounded-full blur-3xl"
        animate={{
          x: [0, -80, 0],
          y: [0, -60, 0],
          scale: [1.2, 1, 1.2],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-500/10 via-emerald-500/10 to-teal-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.15, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />

      {/* Floating Shapes */}
      {floatingShapes.map((shape) => (
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
      {particles.map((particle) => (
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
      {shootingStars.map((star) => (
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
