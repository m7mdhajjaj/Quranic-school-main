import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Users, BookOpen, GraduationCap, Heart, Clock, UserPlus, MessageCircle } from "lucide-react";
import GoalsSkeleton from "../../components/Skeleton/GoalsSkeleton";
import { Card } from "../../components/shared";

const Goals = () => {
  const [loading, setLoading] = useState(true);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      easing: "ease-in-out",
    });

    // Simulate loading for demonstration
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <GoalsSkeleton />;
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100"
      dir="rtl">
      <div className="container mx-auto py-12 px-4">
        {/* Header Section */}
        <div className="text-center mb-16" data-aos="fade-down">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            أهـــدافـــنا
          </h1>
          <div className="w-24 h-1 bg-emerald-600 mx-auto mb-6"></div>
          <p className="text-slate-600 text-lg max-w-3xl mx-auto">
            نسعى في مدرسة المهاجرين لتحقيق مجموعة من الأهداف السامية التي تعزز
            الارتقاء بمستوى تعليم القرآن الكريم وخدمته
          </p>
        </div>

        {/* Main Goals Section */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Goal 1 */}
            <Card
              className="overflow-hidden flex flex-col md:flex-row"
              data-aos="fade-up"
              data-aos-delay="100">
              <div className="bg-emerald-600 text-white p-6 md:w-1/4 flex justify-center items-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <Users className="w-10 h-10 text-emerald-600" />
                </div>
              </div>
              <div className="p-6 md:w-3/4">
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  بناء جيل صالح
                </h3>
                <p className="text-slate-600">
                  بناء جيل صالح على منهج أهل السنة والجماعة، يفهم أصول دينه
                  فهمًا صحيحًا مقرونًا بالأدلة الشرعية من الكتاب والسنة.
                </p>
              </div>
            </Card>

            {/* Goal 2 */}
            <Card
              className="overflow-hidden flex flex-col md:flex-row"
              data-aos="fade-up"
              data-aos-delay="200">
              <div className="bg-teal-700 text-white p-6 md:w-1/4 flex justify-center items-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-teal-700" />
                </div>
              </div>
              <div className="p-6 md:w-3/4">
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  إعداد جيل حافظ
                </h3>
                <p className="text-slate-600">
                  إعداد جيل حافظ متقن لكتاب الله تعالى، يعمل به، ويتقن تلاوته،
                  ويعي تفسيره ومعانيه.
                </p>
              </div>
            </Card>

            {/* Goal 3 */}
            <Card
              className="overflow-hidden flex flex-col md:flex-row"
              data-aos="fade-up"
              data-aos-delay="300">
              <div className="bg-emerald-700 text-white p-6 md:w-1/4 flex justify-center items-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <GraduationCap className="w-10 h-10 text-emerald-700" />
                </div>
              </div>
              <div className="p-6 md:w-3/4">
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  تأهيل معلمين
                </h3>
                <p className="text-slate-600">
                  تأهيل معلمين للقرآن الكريم بأسلوب حضاري وحديث، يتميزون بروح
                  الشباب والقدرة على التأثير والتجديد.
                </p>
              </div>
            </Card>

            {/* Goal 4 */}
            <Card
              className="overflow-hidden flex flex-col md:flex-row"
              data-aos="fade-up"
              data-aos-delay="400">
              <div className="bg-teal-800 text-white p-6 md:w-1/4 flex justify-center items-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <Heart className="w-10 h-10 text-teal-800" />
                </div>
              </div>
              <div className="p-6 md:w-3/4">
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  غرس القيم
                </h3>
                <p className="text-slate-600">
                  غرس القيم والأخلاق الإسلامية المستمدة من القرآن الكريم.
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Additional Goals */}
        <div
          className="bg-gradient-to-r from-teal-900 to-emerald-800 rounded-2xl shadow-lg py-10 px-6 mb-16"
          data-aos="fade-up"
          data-aos-duration="1200">
          <h2 className="text-2xl font-bold text-white text-center mb-10">
            أهدافنا الإضافية
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Additional Goal 1 */}
            <Card
              className="bg-white/10 backdrop-blur-sm border-none"
              data-aos="zoom-in"
              data-aos-delay="100">
              <div className="w-14 h-14 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                <Clock className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-3">
                ربط الطلاب بالسلف
              </h3>
              <p className="text-white/80 text-center">
                ربط الطلاب بسير السلف الصالح من أهل القرآن وأثرهم في الأمة.
              </p>
            </Card>

            {/* Additional Goal 2 */}
            <Card
              className="bg-white/10 backdrop-blur-sm border-none"
              data-aos="zoom-in"
              data-aos-delay="200">
              <div className="w-14 h-14 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                <UserPlus className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-3">
                إشراك الأسرة
              </h3>
              <p className="text-white/80 text-center">
                إشراك الأسرة في متابعة أبنائهم وتعزيز دورها في ترسيخ الحفظ
                والمتابعة.
              </p>
            </Card>

            {/* Additional Goal 3 */}
            <Card
              className="bg-white/10 backdrop-blur-sm border-none"
              data-aos="zoom-in"
              data-aos-delay="300">
              <div className="w-14 h-14 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-3">
                تنمية الثقة
              </h3>
              <p className="text-white/80 text-center">
                تنمية الثقة بالنفس والقدرة على الإلقاء من خلال مشاركات قرآنية
                صوتية وتفسيرية.
              </p>
            </Card>
          </div>
        </div>

        {/* Quote Section */}
        <Card
          className="text-center mb-16 relative overflow-hidden"
          data-aos="fade-up"
          data-aos-offset="200">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-600 to-teal-500"></div>
          <svg
            className="w-16 h-16 text-emerald-100 mx-auto mb-6"
            fill="currentColor"
            viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <p className="text-xl text-slate-700 mb-6">
            "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ"
          </p>
          <p className="text-sm text-slate-500">- حديث شريف رواه البخاري -</p>
        </Card>
      </div>

    </div>
  );
};

export default Goals;
