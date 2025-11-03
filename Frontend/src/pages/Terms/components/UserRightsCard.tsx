import { Card, FeatureList } from '../../../components/shared';
import { Shield, UserCheck } from 'lucide-react';

const UserRightsCard = () => {
  return (
    <Card
      variant="default"
      padding="lg"
      className="bg-white/80 backdrop-blur border border-blue-100"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xl">👥</span>
        <h2 className="text-2xl font-bold text-blue-800">
          حقوق ومسؤوليات المستخدم
        </h2>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {/* Rights Section */}
        <Card
          variant="gradient"
          padding="md"
          className="bg-green-50"
        >
          <h3 className="font-semibold text-green-800 mb-3">حقوقك:</h3>
          <FeatureList
            align="start"
            className="!text-gray-700"
            items={[
              {
                icon: <Shield className="w-5 h-5 text-green-600" />,
                text: "الوصول إلى جميع المحتويات التعليمية المتاحة لدورك"
              },
              {
                icon: <Shield className="w-5 h-5 text-green-600" />,
                text: "الحصول على الدعم الفني والتعليمي المطلوب"
              },
              {
                icon: <Shield className="w-5 h-5 text-green-600" />,
                text: "حماية بياناتك الشخصية وفقاً لسياسة الخصوصية"
              },
              {
                icon: <Shield className="w-5 h-5 text-green-600" />,
                text: "تقديم الملاحظات والاقتراحات للتحسين"
              }
            ]}
          />
        </Card>

        {/* Responsibilities Section */}
        <Card
          variant="gradient"
          padding="md"
          className="bg-orange-50"
        >
          <h3 className="font-semibold text-orange-800 mb-3">مسؤولياتك:</h3>
          <FeatureList
            align="start"
            className="!text-gray-700"
            items={[
              {
                icon: <UserCheck className="w-5 h-5 text-orange-600" />,
                text: "استخدام المنصة لأغراض تعليمية فقط"
              },
              {
                icon: <UserCheck className="w-5 h-5 text-orange-600" />,
                text: "احترام جميع المستخدمين والمعلمين"
              },
              {
                icon: <UserCheck className="w-5 h-5 text-orange-600" />,
                text: "الحفاظ على سرية بيانات تسجيل الدخول"
              },
              {
                icon: <UserCheck className="w-5 h-5 text-orange-600" />,
                text: "الإبلاغ عن أي مشاكل أو انتهاكات"
              }
            ]}
          />
        </Card>
      </div>
    </Card>
  );
};

export default UserRightsCard;
