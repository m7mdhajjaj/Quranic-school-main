import { Card, FeatureList } from "@/components/UI";
import { ShieldCheck, UserCog } from 'lucide-react';

const DataProtectionCard = () => {
  return (
    <Card
      variant="default"
      padding="lg"
      className="bg-white/80 backdrop-blur border border-emerald-100"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xl">🔐</span>
        <h2 className="text-2xl font-bold text-emerald-800">حماية البيانات</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {/* Our Commitments */}
        <Card variant="gradient" padding="md" className="bg-green-50">
          <h3 className="font-semibold text-green-800 mb-3">التزاماتنا:</h3>
          <FeatureList
            align="start"
            className="!text-gray-700"
            items={[
              {
                icon: <ShieldCheck className="w-5 h-5 text-green-600" />,
                text: 'عدم بيع أو مشاركة بياناتك مع أي طرف ثالث',
              },
              {
                icon: <ShieldCheck className="w-5 h-5 text-green-600" />,
                text: 'استخدام بروتوكولات تشفير متقدمة (SSL/TLS)',
              },
              {
                icon: <ShieldCheck className="w-5 h-5 text-green-600" />,
                text: 'نسخ احتياطي منتظم وآمن لقاعدة البيانات',
              },
              {
                icon: <ShieldCheck className="w-5 h-5 text-green-600" />,
                text: 'وصول محدود فقط للموظفين المخولين',
              },
            ]}
          />
        </Card>

        {/* Your Rights */}
        <Card variant="gradient" padding="md" className="bg-purple-50">
          <h3 className="font-semibold text-purple-800 mb-3">حقوقك:</h3>
          <FeatureList
            align="start"
            className="!text-gray-700"
            items={[
              {
                icon: <UserCog className="w-5 h-5 text-purple-600" />,
                text: 'طلب نسخة من بياناتك المخزنة',
              },
              {
                icon: <UserCog className="w-5 h-5 text-purple-600" />,
                text: 'تعديل أو تصحيح بياناتك',
              },
              {
                icon: <UserCog className="w-5 h-5 text-purple-600" />,
                text: 'طلب حذف بياناتك في أي وقت',
              },
              {
                icon: <UserCog className="w-5 h-5 text-purple-600" />,
                text: 'سحب الموافقة على معالجة بياناتك',
              },
            ]}
          />
        </Card>
      </div>
    </Card>
  );
};

export default DataProtectionCard;
