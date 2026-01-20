import { Users, BookOpen, GraduationCap, Heart, Clock, UserPlus, MessageCircle, Target } from "lucide-react";
import { Card } from "@/components/UI/Card";

const Goals = () => {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20"
      dir="rtl">
      
      {/* Header Section - مثل DailyMarks */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 text-white rounded-b-3xl shadow-xl p-6 pb-8 mb-8">
        <div className="container mx-auto">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* أيقونة */}
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl shadow-lg">
              <Target className="w-10 h-10 md:w-12 md:h-12" />
            </div>

            {/* العنوان */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2">
                أهـــدافـــنا
              </h1>
              <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto">
                نسعى في مدرسة المهاجرين لتحقيق مجموعة من الأهداف السامية التي تعزز الارتقاء بمستوى تعليم القرآن الكريم
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[98%] mx-auto px-4 md:px-6 lg:px-8 pb-12">
        {/* Main Goals Section */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Goal 1 */}
            <Card
              className="overflow-hidden flex flex-col md:flex-row bg-white border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 rounded-2xl">
              <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white p-6 md:w-1/4 flex justify-center items-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Users className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="p-6 md:w-3/4 bg-gradient-to-br from-white via-white to-emerald-50/30">
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  بناء جيل صالح
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  بناء جيل صالح على منهج أهل السنة والجماعة، يفهم أصول دينه
                  فهمًا صحيحًا مقرونًا بالأدلة الشرعية من الكتاب والسنة.
                </p>
              </div>
            </Card>

            {/* Goal 2 */}
            <Card
              className="overflow-hidden flex flex-col md:flex-row bg-white border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 rounded-2xl">
              <div className="bg-gradient-to-br from-teal-600 to-slate-700 text-white p-6 md:w-1/4 flex justify-center items-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="p-6 md:w-3/4 bg-gradient-to-br from-white via-white to-teal-50/30">
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  إعداد جيل حافظ
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  إعداد جيل حافظ متقن لكتاب الله تعالى، يعمل به، ويتقن تلاوته،
                  ويعي تفسيره ومعانيه.
                </p>
              </div>
            </Card>

            {/* Goal 3 */}
            <Card
              className="overflow-hidden flex flex-col md:flex-row bg-white border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 rounded-2xl">
              <div className="bg-gradient-to-br from-emerald-700 to-teal-700 text-white p-6 md:w-1/4 flex justify-center items-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <GraduationCap className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="p-6 md:w-3/4 bg-gradient-to-br from-white via-white to-emerald-50/30">
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  تأهيل معلمين
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  تأهيل معلمين للقرآن الكريم بأسلوب حضاري وحديث، يتميزون بروح
                  الشباب والقدرة على التأثير والتجديد.
                </p>
              </div>
            </Card>

            {/* Goal 4 */}
            <Card
              className="overflow-hidden flex flex-col md:flex-row bg-white border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 rounded-2xl">
              <div className="bg-gradient-to-br from-slate-700 to-teal-800 text-white p-6 md:w-1/4 flex justify-center items-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Heart className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="p-6 md:w-3/4 bg-gradient-to-br from-white via-white to-slate-50/30">
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  غرس القيم
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  غرس القيم والأخلاق الإسلامية المستمدة من القرآن الكريم.
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Additional Goals */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 rounded-2xl shadow-xl py-10 px-6 mb-12">
          <h2 className="text-2xl font-bold text-white text-center mb-10">
            أهدافنا الإضافية
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Additional Goal 1 */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 rounded-2xl">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-3">
                ربط الطلاب بالسلف
              </h3>
              <p className="text-white/80 text-center leading-relaxed">
                ربط الطلاب بسير السلف الصالح من أهل القرآن وأثرهم في الأمة.
              </p>
            </Card>

            {/* Additional Goal 2 */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 rounded-2xl">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-3">
                إشراك الأسرة
              </h3>
              <p className="text-white/80 text-center leading-relaxed">
                إشراك الأسرة في متابعة أبنائهم وتعزيز دورها في ترسيخ الحفظ
                والمتابعة.
              </p>
            </Card>

            {/* Additional Goal 3 */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 rounded-2xl">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-3">
                تنمية الثقة
              </h3>
              <p className="text-white/80 text-center leading-relaxed">
                تنمية الثقة بالنفس والقدرة على الإلقاء من خلال مشاركات قرآنية
                صوتية وتفسيرية.
              </p>
            </Card>
          </div>
        </div>

        {/* Quote Section */}
        <Card className="text-center relative overflow-hidden bg-white border border-slate-200/60 shadow-sm rounded-2xl">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-600"></div>
          <svg
            className="w-16 h-16 text-emerald-100 mx-auto mb-6 mt-4"
            fill="currentColor"
            viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <p className="text-xl text-slate-700 mb-6 font-semibold">
            "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ"
          </p>
          <p className="text-sm text-slate-500 pb-2">- حديث شريف رواه البخاري -</p>
        </Card>
      </div>

    </div>
  );
};

export default Goals;
