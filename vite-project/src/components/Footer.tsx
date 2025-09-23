const Footer = () => {
    return (
      <footer className="bg-gradient-to-r from-teal-700 to-emerald-600 text-white py-6 px-4 mt-6">
        <div className="container mx-auto" dir="rtl">
          {/* Main Footer Content (optional section) */}
          <div className="flex flex-col md:flex-row justify-between">
            {/* يمكن إضافة محتوى إضافي هنا */}
          </div>

          {/* Stats Section */}
          <div className="mt-8 pt-4 border-t border-teal-500/30">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {/* عدد الطلاب */}
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg
                    className="w-5 h-5 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24">
                    <path d="M17 20h5v-2a4 4 0 00-5-4M9 20H4v-2a4 4 0 015-4m8-4a4 4 0 11-8 0 4 4 0 018 0zM12 4a4 4 0 00-4 4" />
                  </svg>
                </div>
                <h5 className="text-sm font-medium mb-1">عدد طلاب الحلقة</h5>
                <p className="text-xl font-bold text-white">90</p>
              </div>

              {/* عدد الخطط */}
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg
                    className="w-5 h-5 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h5 className="text-sm font-medium mb-1">خطط متميزة</h5>
                <p className="text-xl font-bold text-white">3</p>
              </div>

              {/* عدد المعلمين */}
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg
                    className="w-5 h-5 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24">
                    <path d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
                  </svg>
                </div>
                <h5 className="text-sm font-medium mb-1">عدد المعلمين</h5>
                <p className="text-xl font-bold text-white">3</p>
              </div>

              {/* تاريخ البداية */}
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg
                    className="w-5 h-5 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24">
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h5 className="text-sm font-medium mb-1">تاريخ التأسيس</h5>
                <p className="text-lg font-bold text-white">25/2/2024</p>
              </div>
            </div>
          </div>

          {/* حقوق النشر */}
          <div className="mt-8 pt-4 border-t border-teal-500/30 text-sm text-teal-100">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-0">
              {/* الحقوق - يمين */}
              <p className="text-center w-full md:w-auto">
                جميع الحقوق محفوظة © {new Date().getFullYear()} لدى محمد حجاج
              </p>

              {/* معلومات التواصل - يسار */}
              <div className="flex flex-col md:flex-row items-center gap-3 text-left w-full md:w-auto">
                {/* رقم الهاتف */}
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-teal-200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24">
                    <path d="M3 5h18M3 12h18M3 19h18" />
                  </svg>
                  <a href="tel:+972599309747" className="hover:underline">
                    +972599309747
                  </a>
                </div>

                {/* الإيميل */}
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-teal-200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24">
                    <path d="M16 12l-4-4-4 4m8 0v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4" />
                  </svg>
                  <a
                    href="mailto:mohd.hajjaj80@gmail.com"
                    className="hover:underline">
                    mohd.hajjaj80@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  };
  
  export default Footer;
  