import {
  FaPhone,
  FaEnvelope,
  FaWhatsapp,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaCalendarAlt,
} from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const partners = [
    {
      name: "محمد حجاج",
      role: "مطور ومصمم",
      phone: "+972599309747",
      email: "mohd.hajjaj80@gmail.com",
      whatsapp: "972599309747",
    },
    {
      name: "قصي دويكات",
      role: "مطور ومصمم",
      phone: "+970599185961",
      whatsapp: "970599185961",
    },
  ];

  const quickLinks = [
    { name: "الرئيسية", path: "/" },
    { name: "الأخبار", path: "/news" },
    { name: "الأهداف", path: "/goals" },
    { name: "الاختبارات", path: "/test" },
    { name: "التقارير", path: "/reports" },
    { name: "تواصل معنا", path: "/contact" },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-emerald-700 via-teal-700 to-green-800 text-white overflow-hidden mt-auto">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 footer-background-pattern"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8" dir="rtl">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* About Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center animate-bounce-slow">
                <span className="text-2xl">🎓</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">مدرسة القرآن الكريم</h3>
                <p className="text-emerald-200 text-sm">أكاديمية المهاجرين</p>
              </div>
            </div>
            <p className="text-emerald-100 text-sm leading-relaxed">
              نسعى لتقديم تعليم قرآني متميز ورعاية طلابنا بأفضل الوسائل
              التعليمية الحديثة
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/profile.php?id=61564605862440"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-12"
                aria-label="Facebook">
                <FaFacebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-12"
                aria-label="Twitter">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-12"
                aria-label="Instagram">
                <FaInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
              <div className="w-1 h-6 bg-emerald-300 rounded-full animate-pulse"></div>
              روابط سريعة
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li
                  key={index}
                  className="animate-slide-in"
                  style={{ animationDelay: `${index * 50}ms` }}>
                  <a
                    href={link.path}
                    className="text-emerald-100 hover:text-white hover:pr-2 transition-all duration-300 flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full group-hover:w-2 transition-all"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Partners Info */}
          <div className="lg:col-span-2">
            <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
              <div className="w-1 h-6 bg-emerald-300 rounded-full animate-pulse"></div>
              فريق العمل
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {partners.map((partner, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-3 hover:bg-white/15 transition-all duration-300 border border-white/20 hover:scale-105 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-white font-bold">
                        {partner.name.split(" ")[0][0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-white text-sm">
                        {partner.name}
                      </h5>
                      <p className="text-emerald-200 text-xs mb-2">
                        {partner.role}
                      </p>
                      <div className="space-y-1">
                        <a
                          href={`tel:${partner.phone}`}
                          className="flex items-center gap-2 text-emerald-100 hover:text-white text-xs transition-colors group">
                          <FaPhone className="w-3 h-3 group-hover:scale-110 transition-transform" />
                          <span>{partner.phone}</span>
                        </a>
                        {partner.email && (
                          <a
                            href={`mailto:${partner.email}`}
                            className="flex items-center gap-2 text-emerald-100 hover:text-white text-xs transition-colors group">
                            <FaEnvelope className="w-3 h-3 group-hover:scale-110 transition-transform" />
                            <span className="truncate">{partner.email}</span>
                          </a>
                        )}
                        <a
                          href={`https://wa.me/${partner.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-emerald-100 hover:text-white text-xs transition-colors group">
                          <FaWhatsapp className="w-3 h-3 group-hover:scale-110 transition-transform" />
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
        <div className="pt-6 border-t border-emerald-600/30">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex flex-col md:flex-row items-center gap-2 text-emerald-100 text-sm">
              <div className="flex items-center gap-2">
                <span>جميع الحقوق محفوظة © {currentYear}</span>
                <span className="hidden md:inline">•</span>
                {/* <span className="flex items-center gap-1">
                  صُنع بـ{" "}
                  <FaHeart className="w-4 h-4 text-red-400 animate-pulse" /> في
                  فلسطين
                </span> */}
              </div>
              <div className="flex items-center gap-2 mt-1 md:mt-0 md:mr-4">
                <FaCalendarAlt className="w-4 h-4 text-amber-400" />
                <span className="text-amber-200 font-medium">
                  تأسس في: 25/2/2024
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-emerald-200">
              <a href="/privacy" className="hover:text-white transition-colors">
                سياسة الخصوصية
              </a>
              <span className="hidden md:inline">•</span>
              <a href="/terms" className="hover:text-white transition-colors">
                الشروط والأحكام
              </a>
              <span className="hidden md:inline">•</span>
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
