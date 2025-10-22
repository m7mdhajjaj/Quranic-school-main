import { useState, useEffect } from "react";
import type { NewsHeaderProps } from "../utils/types";

const NewsHeader = ({ 
  isTeacherOrAdmin, 
  onAddNews,
  socketConnected,
 
}: NewsHeaderProps) => {
  // Only show socket indicator in development mode
  const isDev = import.meta.env.DEV;
  const [showSocketIndicator, setShowSocketIndicator] = useState(false);

  // Toggle socket indicator with 'D' key
  useEffect(() => {
    if (!isDev) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Check if 'D' or 'd' is pressed (without Ctrl, Alt, Meta)
      if ((e.key === 'D' || e.key === 'd') && !e.ctrlKey && !e.altKey && !e.metaKey) {
        // Don't toggle if typing in an input/textarea
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return;
        }
        
        setShowSocketIndicator(prev => !prev);
        console.log('🔌 Socket indicator toggled');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isDev]);

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1
            className="text-3xl md:text-4xl font-bold text-emerald-800"
            data-aos="fade-down">
            آخر الأخبار والفعاليات
          </h1>

          {/* Socket Indicator Badge */}
          {showSocketIndicator && (
            <div 
              className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full shadow-md px-3 py-1.5 border border-gray-200 dark:border-gray-700"
              data-aos="fade-right"
              data-aos-delay="100"
              title={socketConnected ? 'متصل بالسوكت - التحديثات الفورية مفعلة' : 'غير متصل بالسوكت'}>
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  socketConnected 
                    ? 'bg-emerald-500 shadow-emerald-500/50 shadow-lg animate-pulse' 
                    : 'bg-red-500 shadow-red-500/50 shadow-lg'
                }`}
              />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {socketConnected ? 'متصل' : 'غير متصل'}
              </span>
            </div>
          )}
        </div>

        {isTeacherOrAdmin && (
          <button
            onClick={onAddNews}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg font-semibold"
            data-aos="fade-left">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            إضافة خبر جديد
          </button>
        )}
      </div>

      <p
        className="text-lg mb-12 max-w-3xl text-gray-600"
        data-aos="fade-up"
        data-aos-delay="100">
        تابع أحدث أخبار وفعاليات مدرسة المهاجرين لتعليم القرآن الكريم، واطلع
        على الأنشطة والمسابقات القادمة
      </p>
    </section>
  );
};

export default NewsHeader;
