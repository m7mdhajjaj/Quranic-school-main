// ============================================================================
// About.tsx - صفحة نبذة عن المدرسة
// ============================================================================

import { motion } from 'framer-motion';
import { 
  FaQuran, 
  FaGraduationCap, 
  FaMosque, 
  FaUsers, 
  FaHeart,
  FaAward,
  FaBookOpen
} from 'react-icons/fa';
import { 
  Target, 
  Eye, 
  BookOpen, 
  Users, 
  Award, 
  Heart,
  CheckCircle2
} from 'lucide-react';

// ============================================================================
// Animation Variants
// ============================================================================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

// ============================================================================
// Stats Card Component
// ============================================================================
interface StatCardProps {
  icon: React.ReactNode;
  number: string;
  label: string;
  delay: number;
}

const StatCard = ({ icon, number, label, delay }: StatCardProps) => (
  <motion.div
    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center group hover:shadow-xl transition-all duration-300"
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -5 }}
  >
    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-3xl font-bold text-emerald-700 mb-2">{number}</h3>
    <p className="text-gray-600">{label}</p>
  </motion.div>
);

// ============================================================================
// Feature Card Component
// ============================================================================
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <motion.div
    className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 group"
    variants={itemVariants}
    whileHover={{ y: -5 }}
  >
    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </motion.div>
);

// ============================================================================
// Main About Component
// ============================================================================
const About = () => {
  const stats = [
    { icon: <FaUsers />, number: '500+', label: 'طالب وطالبة' },
    { icon: <FaGraduationCap />, number: '50+', label: 'معلم ومعلمة' },
    { icon: <FaQuran />, number: '30+', label: 'حلقة قرآنية' },
    { icon: <FaAward />, number: '100+', label: 'خريج متميز' },
  ];

  const features = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'منهج متكامل',
      description: 'نظام تعليمي شامل يجمع بين الحفظ والتلاوة والتجويد مع متابعة دقيقة للتقدم',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'كوادر مؤهلة',
      description: 'نخبة من المعلمين والمعلمات المتخصصين في تعليم القرآن الكريم وأحكام التجويد',
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'متابعة مستمرة',
      description: 'نظام متابعة إلكتروني يربط بين المعلم والطالب وولي الأمر لضمان التقدم المستمر',
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'تحفيز وتشجيع',
      description: 'نظام نقاط ومكافآت يحفز الطلاب على التميز والمنافسة الإيجابية',
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'بيئة إيمانية',
      description: 'أجواء روحانية تساعد على التركيز والخشوع أثناء تلاوة وحفظ كتاب الله',
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: 'تقنيات حديثة',
      description: 'استخدام أحدث التقنيات في التعليم عن بعد والمتابعة الإلكترونية',
    },
  ];

  const values = [
    'الإخلاص في العمل لله تعالى',
    'الإتقان في تعليم كتاب الله',
    'الرحمة واللين مع الطلاب',
    'التطوير المستمر للمناهج',
    'التعاون بين المعلمين والأهل',
    'غرس حب القرآن في النفوس',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20" dir="rtl">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Icon */}
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-6 shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
            >
              <FaMosque className="text-4xl text-white" />
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
              نبذة عن{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                أكاديمية المهاجرين
              </span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              أكاديمية المهاجرين القرآنية هي صرح تعليمي متميز يهدف إلى تعليم كتاب الله عز وجل
              وتحفيظه للطلاب من مختلف الأعمار، مع التركيز على جودة التعليم والمتابعة المستمرة
            </p>

            {/* Decorative Verse */}
            <motion.div
              className="inline-block bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-md border border-emerald-100"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-emerald-700 text-xl font-arabic">
                ﴿ خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ ﴾
              </p>
              <p className="text-gray-500 text-sm mt-2">رواه البخاري</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                icon={stat.icon}
                number={stat.number}
                label={stat.label}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Vision */}
            <motion.div
              className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-xl"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <Eye className="w-7 h-7" />
                </div>
                <h2 className="text-3xl font-bold">رؤيتنا</h2>
              </div>
              <p className="text-lg leading-relaxed text-emerald-50">
                أن نكون الوجهة الأولى لتعليم القرآن الكريم في المنطقة، 
                من خلال تقديم تجربة تعليمية متميزة تجمع بين الأصالة والمعاصرة،
                وتخريج جيل قرآني واعٍ يحمل كتاب الله علماً وعملاً وأخلاقاً.
              </p>
            </motion.div>

            {/* Mission */}
            <motion.div
              className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                  <Target className="w-7 h-7" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">رسالتنا</h2>
              </div>
              <p className="text-lg leading-relaxed text-gray-600">
                تعليم كتاب الله تعالى وتحفيظه بأساليب تربوية حديثة،
                مع المحافظة على أحكام التجويد والتلاوة الصحيحة،
                وتوفير بيئة تعليمية محفزة تساعد الطلاب على التميز والإبداع.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              لماذا{' '}
              <span className="text-emerald-600">أكاديمية المهاجرين؟</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              نقدم تجربة تعليمية فريدة تجمع بين جودة التعليم والتقنيات الحديثة
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 rounded-3xl p-8 md:p-12 shadow-xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                قيمنا ومبادئنا
              </h2>
              <p className="text-emerald-100 text-lg">
                نلتزم بمجموعة من القيم التي توجه عملنا
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CheckCircle2 className="w-6 h-6 text-emerald-300 flex-shrink-0" />
                  <span className="text-white font-medium">{value}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <FaHeart className="text-5xl text-red-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              انضم إلى عائلة المهاجرين
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              كن جزءاً من رحلة تعلم القرآن الكريم معنا، واستمتع بتجربة تعليمية فريدة
            </p>
            <motion.a
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaBookOpen />
              سجل الآن
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
