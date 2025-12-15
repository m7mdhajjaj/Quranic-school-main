import { memo } from "react";
import { Newspaper } from 'lucide-react';

const NewsHeader = memo(() => {
  return (
    <section className="mb-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 text-center">
          {/* أيقونة */}
          <div className="flex justify-center mb-2 sm:mb-3">
            <div className="relative">
              {/* خلفية متوهجة */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
              
              {/* الأيقونة */}
              <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full p-4 sm:p-6 shadow-2xl">
                <Newspaper className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
              </div>
            </div>
          </div>

          {/* العنوان */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-emerald-700 mb-2 sm:mb-3">
            آخر الأخبار والفعاليات
          </h1>
          
          {/* الوصف */}
          <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto px-4 mb-2 sm:mb-3">
            تابع أحدث أخبار وفعاليات مدرسة المهاجرين لتعليم القرآن الكريم، واطلع على الأنشطة والمسابقات القادمة
          </p>
          
          {/* خط فاصل */}
          <div className="flex justify-center mt-2 sm:mt-3">
            <div className="h-1 w-20 sm:w-24 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
});

NewsHeader.displayName = 'NewsHeader';

export default NewsHeader;
