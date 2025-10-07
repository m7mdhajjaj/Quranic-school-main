
import React from 'react';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 font-arabic" dir="rtl" lang="ar">
      <div className="max-w-5xl mx-auto">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-200/20 rounded-full blur-3xl"></div>
        </div>

        {/* Header Section */}
        <div className="text-center mb-12 relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full mb-6 shadow-lg">
            <span className="text-3xl filter drop-shadow-sm">📋</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 mb-4 leading-tight">
            الشروط والأحكام
          </h1>
          <p className="text-xl md:text-2xl text-blue-700 font-medium max-w-2xl mx-auto leading-relaxed">
            قواعد وضوابط استخدام منصتنا التعليمية المبتكرة
          </p>
          <div className="flex justify-center mt-6">
            <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-sm"></div>
          </div>
        </div>

        {/* Content Cards */}
        <div className="space-y-8 relative z-10">
          {/* Introduction Card */}
          <div className="group bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-blue-100 p-8 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                <span className="text-2xl filter drop-shadow-sm">📝</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-blue-800 group-hover:text-blue-700 transition-colors duration-300">مقدمة</h2>
            </div>
            <div className="bg-gradient-to-l from-blue-50 to-indigo-50 rounded-2xl p-6 border-r-4 border-blue-500">
              <p className="text-gray-800 leading-loose text-lg md:text-xl font-medium">
                أهلاً وسهلاً بك في <span className="font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-lg">مدرسة القرآن الكريم</span>، منصتك التعليمية المتخصصة في علوم القرآن والتربية الإسلامية. باستخدامك لهذه المنصة التعليمية المتطورة، فإنك تقبل وتوافق على الالتزام الكامل بجميع الشروط والأحكام التالية. نرجو منك قراءة هذه الشروط بعناية فائقة وتمعن قبل المتابعة في استخدام موقعنا ومنصتنا التعليمية.
              </p>
            </div>
          </div>

          {/* User Rights and Responsibilities */}
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-blue-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">👥</span>
              <h2 className="text-2xl font-bold text-blue-800">حقوق ومسؤوليات المستخدم</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-xl">
                <h3 className="font-semibold text-green-800 mb-3">حقوقك:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">◄</span>
                    <span>الوصول إلى جميع المحتويات التعليمية المتاحة لدورك</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">◄</span>
                    <span>الحصول على الدعم الفني والتعليمي المطلوب</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">◄</span>
                    <span>حماية بياناتك الشخصية وفقاً لسياسة الخصوصية</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">◄</span>
                    <span>تقديم الملاحظات والاقتراحات للتحسين</span>
                  </li>
                </ul>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl">
                <h3 className="font-semibold text-orange-800 mb-3">مسؤولياتك:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-0.5">◄</span>
                    <span>استخدام المنصة لأغراض تعليمية فقط</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-0.5">◄</span>
                    <span>احترام جميع المستخدمين والمعلمين</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-0.5">◄</span>
                    <span>الحفاظ على سرية بيانات تسجيل الدخول</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-0.5">◄</span>
                    <span>الإبلاغ عن أي مشاكل أو انتهاكات</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Usage Rules */}
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-blue-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">⚖️</span>
              <h2 className="text-2xl font-bold text-blue-800">قواعد الاستخدام</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl">
                <h3 className="font-semibold text-blue-800 mb-2">المسموح:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">✓</span>
                    استخدام المنصة للدراسة ومراجعة المواد التعليمية
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">✓</span>
                    المشاركة في الأنشطة والاختبارات التفاعلية
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">✓</span>
                    التواصل مع المعلمين والطلاب بشكل محترم
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">✓</span>
                    تحميل الملفات والمواد المصرح بها
                  </li>
                </ul>
              </div>
              <div className="bg-red-50 p-4 rounded-xl">
                <h3 className="font-semibold text-red-800 mb-2">الممنوع:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-red-600">✗</span>
                    نشر محتوى مسيء أو غير لائق أو مخالف للتعاليم الإسلامية
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-600">✗</span>
                    مشاركة بيانات تسجيل الدخول مع أشخاص آخرين
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-600">✗</span>
                    محاولة اختراق النظام أو الوصول غير المصرح به
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-600">✗</span>
                    استخدام المنصة لأغراض تجارية أو دعائية
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Academic Policies */}
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-blue-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">🎓</span>
              <h2 className="text-2xl font-bold text-blue-800">السياسات الأكاديمية</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-emerald-50 p-4 rounded-xl">
                <h3 className="font-semibold text-emerald-800 mb-2">الحضور والغياب:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600">◄</span>
                    يجب على الطلاب الحضور في المواعيد المحددة
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600">◄</span>
                    الإبلاغ عن الغياب مسبقاً في حالات الضرورة
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600">◄</span>
                    متابعة الدروس المفقودة والتعويض عنها
                  </li>
                </ul>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl">
                <h3 className="font-semibold text-purple-800 mb-2">التقييم والاختبارات:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-purple-600">◄</span>
                    أداء جميع الاختبارات والواجبات في الوقت المحدد
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-600">◄</span>
                    عدم الغش أو محاولة الحصول على إجابات بطرق غير مشروعة
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-600">◄</span>
                    احترام نتائج التقييم والعمل على التحسن المستمر
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Updates and Changes */}
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-blue-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">🔄</span>
              <h2 className="text-2xl font-bold text-blue-800">التحديثات والتغييرات</h2>
            </div>
            <div className="bg-yellow-50 p-4 rounded-xl">
              <p className="text-gray-700 leading-relaxed">
                تحتفظ إدارة المدرسة بالحق في تحديث هذه الشروط والأحكام في أي وقت. سيتم إشعار المستخدمين بأي تغييرات مهمة، وسيكون استمرار استخدام المنصة بمثابة موافقة على الشروط المحدثة.
              </p>
            </div>
          </div>

          {/* Contact and Agreement */}
          <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="text-center relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6 shadow-lg">
                <span className="text-3xl filter drop-shadow-sm">✍️</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-sm">الموافقة والتواصل</h2>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20">
                <p className="text-lg md:text-xl leading-relaxed font-medium">
                  باستخدامك لهذه المنصة التعليمية المباركة، فإنك تقر وتؤكد بأنك قد قرأت جميع الشروط والأحكام بعناية، وفهمت مضمونها بالكامل، ووافقت عليها طواعية وبكامل الأهلية القانونية
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                  <p className="text-sm font-medium">آخر تحديث: أكتوبر 2025</p>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                  <p className="text-sm font-medium">للاستفسارات: تواصل مع الإدارة</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="mt-12 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 border border-blue-200 shadow-sm">
            <span className="text-blue-600">📋</span>
            <span className="text-blue-800 font-semibold text-sm">ملتزمون بأعلى معايير الشفافية والوضوح</span>
            <span className="text-blue-600">⚖️</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
