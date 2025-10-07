import React from 'react';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-12 px-4 font-arabic" dir="rtl" lang="ar">
      <div className="max-w-5xl mx-auto">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-32 h-32 bg-emerald-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-40 h-40 bg-teal-200/20 rounded-full blur-3xl"></div>
        </div>

        {/* Header Section */}
        <div className="text-center mb-12 relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full mb-6 shadow-lg">
            <span className="text-3xl filter drop-shadow-sm">🔒</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-600 mb-4 leading-tight">
            سياسة الخصوصية
          </h1>
          <p className="text-xl md:text-2xl text-emerald-700 font-medium max-w-2xl mx-auto leading-relaxed">
            نلتزم بحماية بياناتك وخصوصيتك بأعلى معايير الأمان
          </p>
          <div className="flex justify-center mt-6">
            <div className="w-32 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-sm"></div>
          </div>
        </div>

        {/* Content Cards */}
        <div className="space-y-8 relative z-10">
          {/* Introduction Card */}
          <div className="group bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-emerald-100 p-8 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                <span className="text-2xl filter drop-shadow-sm">👁️</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-emerald-800 group-hover:text-emerald-700 transition-colors duration-300">مقدمة</h2>
            </div>
            <div className="bg-gradient-to-l from-emerald-50 to-teal-50 rounded-2xl p-6 border-r-4 border-emerald-500">
              <p className="text-gray-800 leading-loose text-lg md:text-xl font-medium">
                نحن في <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg">مدرسة القرآن الكريم</span> نقدر ثقتك ونعتبرها أمانة في عنقنا. نلتزم بحماية خصوصية وبيانات جميع المستخدمين بأعلى معايير الأمان العالمية. هذه السياسة توضح بشفافية كاملة كيف نجمع ونستخدم ونحمي بياناتك الشخصية عند استخدام منصتنا التعليمية المتطورة.
              </p>
            </div>
          </div>

          {/* Data Collection Card */}
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-emerald-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">📄</span>
              <h2 className="text-2xl font-bold text-emerald-800">جمع البيانات</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-emerald-50 p-4 rounded-xl">
                <h3 className="font-semibold text-emerald-800 mb-2">البيانات التي نجمعها:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600">◄</span>
                    الاسم ومعلومات التواصل (البريد الإلكتروني، رقم الهاتف)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600">◄</span>
                    بيانات الحضور والغياب والدرجات
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600">◄</span>
                    تفاعلك مع المنصة (الاختبارات، الأنشطة، التقارير)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600">◄</span>
                    معلومات تقنية (عنوان IP، نوع المتصفح، تاريخ الزيارة)
                  </li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <h3 className="font-semibold text-blue-800 mb-2">الغرض من جمع البيانات:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">◄</span>
                    تقديم خدمات تعليمية مخصصة وفعالة
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">◄</span>
                    تحسين جودة التعليم ومتابعة التقدم
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">◄</span>
                    ضمان أمان المنصة ومنع الاستخدام غير المشروع
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">◄</span>
                    التواصل مع الطلاب وأولياء الأمور
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Data Protection Card */}
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-emerald-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">🔐</span>
              <h2 className="text-2xl font-bold text-emerald-800">حماية البيانات</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-xl">
                <h3 className="font-semibold text-green-800 mb-3">التزاماتنا:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">◄</span>
                    <span>عدم بيع أو مشاركة بياناتك مع أي طرف ثالث</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">◄</span>
                    <span>استخدام بروتوكولات تشفير متقدمة (SSL/TLS)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">◄</span>
                    <span>نسخ احتياطي منتظم وآمن لقاعدة البيانات</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">◄</span>
                    <span>وصول محدود فقط للموظفين المخولين</span>
                  </li>
                </ul>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl">
                <h3 className="font-semibold text-purple-800 mb-3">حقوقك:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">◄</span>
                    <span>طلب نسخة من بياناتك المخزنة</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">◄</span>
                    <span>تعديل أو تصحيح بياناتك</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">◄</span>
                    <span>طلب حذف بياناتك في أي وقت</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">◄</span>
                    <span>سحب الموافقة على معالجة بياناتك</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact and Updates Card */}
          <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-12 translate-y-12"></div>
            
            <div className="text-center relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6 shadow-lg">
                <span className="text-3xl filter drop-shadow-sm">📞</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-sm">تواصل معنا</h2>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20">
                <p className="text-lg md:text-xl leading-relaxed font-medium">
                  إذا كان لديك أي استفسار حول سياسة الخصوصية أو تريد ممارسة حقوقك في الخصوصية، نحن هنا لمساعدتك والإجابة على جميع استفساراتك
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                  <p className="text-sm font-medium">آخر تحديث: أكتوبر 2025</p>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                  <p className="text-sm font-medium">متاح على مدار الساعة</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="mt-12 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 border border-emerald-200 shadow-sm">
            <span className="text-emerald-600">🔒</span>
            <span className="text-emerald-800 font-semibold text-sm">محمية بأعلى معايير الأمان العالمية</span>
            <span className="text-emerald-600">✨</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
