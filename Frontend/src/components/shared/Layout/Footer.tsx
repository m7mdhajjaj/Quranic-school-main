import {
  FaPhone,
  FaEnvelope,
  FaWhatsapp,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaCalendarAlt,
  FaChartBar,
  FaCog,
  FaUser,
} from 'react-icons/fa';
import { useAuth } from '../../../hooks/useAuth';

const Footer = () => {
  const { isAdmin } = useAuth();
  const currentYear = new Date().getFullYear();

  const partners = [
    {
      name: 'محمد حجاج',
      role: 'مطور ومصمم',
      phone: '+972599309747',
      email: 'mohd.hajjaj80@gmail.com',
      whatsapp: '972599309747',
    },
    {
      name: 'قصي دويكات',
      role: 'مطور ومصمم',
      phone: '+970599185961',
      email: 'qsay.3w@gmail.com',
      whatsapp: '970599185961',
    },
  ];

  // Role-based quick links
  const getQuickLinks = () => {
    if (isAdmin()) {
      return [
        { name: 'لوحة التحكم', path: '/admin/dashboard', icon: FaChartBar },
        { name: 'الملف الشخصي', path: '/profile', icon: FaUser },
        { name: 'الإعدادات', path: '/admin/settings', icon: FaCog },
        { name: 'تواصل معنا', path: '/contact' },
      ];
    } else {
      // Default links for teachers and students
      return [
        { name: 'الرئيسية', path: '/' },
        { name: 'الأخبار', path: '/news' },
        { name: 'الأهداف', path: '/goals' },
        { name: 'الاختبارات', path: '/test' },
        { name: 'التقارير', path: '/reports' },
        { name: 'تواصل معنا', path: '/contact' },
      ];
    }
  };

  const quickLinks = getQuickLinks();

  return (
    <footer className="relative bg-gradient-to-br from-emerald-700 via-teal-700 to-green-800 text-white overflow-hidden mt-auto">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 footer-background-pattern"></div>
      </div>

      <div
        className="relative w-full max-w-none px-2 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8"
        dir="rtl"
      >
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 md:mb-8">
          {/* About Section */}
          <div className="space-y-2 sm:space-y-3 lg:space-y-4">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center animate-bounce-slow">
                <span className="text-xl sm:text-2xl lg:text-3xl">
                  {isAdmin() ? '👑' : '🎓'}
                </span>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold">
                  {isAdmin() ? 'لوحة إدارة المدرسة' : 'مدرسة القرآن الكريم'}
                </h3>
                <p className="text-emerald-200 text-xs sm:text-sm lg:text-base">
                  {isAdmin() ? 'نظام إدارة شامل' : 'أكاديمية المهاجرين'}
                </p>
              </div>
            </div>
            <p className="text-emerald-100 text-xs sm:text-sm lg:text-base xl:text-lg leading-relaxed">
              {isAdmin()
                ? 'إدارة شاملة ومتطورة لجميع جوانب المدرسة من طلاب ومعلمين ومجموعات وتقارير تفصيلية'
                : 'نسعى لتقديم تعليم قرآني متميز ورعاية طلابنا بأفضل الوسائل التعليمية الحديثة'}
            </p>
            <div className="flex gap-2 sm:gap-3 lg:gap-4">
              <a
                href="https://www.facebook.com/profile.php?id=61564605862440"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-12"
                aria-label="Facebook"
              >
                <FaFacebook className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </a>
              <a
                href="#"
                className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-12"
                aria-label="Twitter"
              >
                <FaTwitter className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </a>
              <a
                href="#"
                className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-12"
                aria-label="Instagram"
              >
                <FaInstagram className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2">
              <div className="w-1 h-5 sm:h-6 lg:h-7 bg-emerald-300 rounded-full animate-pulse"></div>
              {isAdmin() ? 'أدوات الإدارة' : 'روابط سريعة'}
            </h4>
            <ul className="space-y-1 sm:space-y-2 lg:space-y-3">
              {quickLinks.map((link, index) => (
                <li
                  key={index}
                  className="animate-slide-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <a
                    href={link.path}
                    className="text-emerald-100 hover:text-white hover:pr-2 transition-all duration-300 flex items-center gap-2 group text-xs sm:text-sm lg:text-base xl:text-lg"
                  >
                    {link.icon && isAdmin() ? (
                      <link.icon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 group-hover:scale-110 transition-all" />
                    ) : (
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-300 rounded-full group-hover:w-2 sm:group-hover:w-2.5 transition-all"></span>
                    )}
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Partners Info / Admin Stats */}
          <div className="sm:col-span-2 lg:col-span-2">
            <h4 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2">
              <div className="w-1 h-5 sm:h-6 lg:h-7 bg-emerald-300 rounded-full animate-pulse"></div>
              فريق العمل
            </h4>

            {/* Always show developers section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3">
              {partners.map((partner, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-2 sm:p-3 lg:p-4 hover:bg-white/15 transition-all duration-300 border border-white/20 hover:scale-105 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-white font-bold text-xs sm:text-sm lg:text-base">
                        {partner.name.split(' ')[0][0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-white text-xs sm:text-sm lg:text-base xl:text-lg">
                        {partner.name}
                      </h5>
                      <p className="text-emerald-200 text-xs sm:text-sm lg:text-base mb-1 sm:mb-2">
                        {partner.role}
                      </p>
                      <div className="space-y-1 sm:space-y-2">
                        <a
                          href={`tel:${partner.phone}`}
                          className="flex items-center gap-1 sm:gap-2 text-emerald-100 hover:text-white text-xs sm:text-sm transition-colors group"
                        >
                          <FaPhone className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 group-hover:scale-110 transition-transform" />
                          <span>{partner.phone}</span>
                        </a>
                        {partner.email && (
                          <a
                            href={`mailto:${partner.email}`}
                            className="flex items-center gap-1 sm:gap-2 text-emerald-100 hover:text-white text-xs sm:text-sm lg:text-base transition-colors group w-full"
                            title={partner.email}
                          >
                            <FaEnvelope className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                            <span className="truncate min-w-0 break-all sm:break-normal">
                              <span className="hidden sm:inline">
                                {partner.email}
                              </span>
                              <span className="sm:hidden">
                                {partner.email.length > 15
                                  ? `${partner.email.substring(0, 12)}...`
                                  : partner.email}
                              </span>
                            </span>
                          </a>
                        )}
                        <a
                          href={`https://wa.me/${partner.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 sm:gap-2 text-emerald-100 hover:text-white text-xs sm:text-sm transition-colors group"
                        >
                          <FaWhatsapp className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 group-hover:scale-110 transition-transform" />
                          <span>واتساب</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-3 sm:pt-4 md:pt-6 border-t border-emerald-600/30">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-2 sm:gap-3 md:gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 lg:gap-3 text-emerald-100 text-xs sm:text-sm lg:text-base">
              <div className="flex items-center gap-1 sm:gap-2 text-center lg:text-right">
                <span>جميع الحقوق محفوظة © {currentYear}</span>
                <span className="hidden sm:inline">•</span>
                {/* <span className="flex items-center gap-1">
                  صُنع بـ{" "}
                  <FaHeart className="w-4 h-4 text-red-400 animate-pulse" /> في
                  فلسطين
                </span> */}
              </div>
              <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-0 lg:mr-4">
                <FaCalendarAlt className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-amber-400" />
                <span className="text-amber-200 font-medium text-xs sm:text-sm lg:text-base">
                  تأسس في: 25/2/2024
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm lg:text-base text-emerald-200">
              <a href="/privacy" className="hover:text-white transition-colors">
                سياسة الخصوصية
              </a>
              <span className="hidden sm:inline">•</span>
              <a href="/terms" className="hover:text-white transition-colors">
                الشروط والأحكام
              </a>
              <span className="hidden sm:inline">•</span>
              <a href="/contact" className="hover:text-white transition-colors">
                اتصل بنا
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        
        .animate-slide-in {
          animation: slide-in 0.5s ease-out forwards;
          opacity: 0;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
