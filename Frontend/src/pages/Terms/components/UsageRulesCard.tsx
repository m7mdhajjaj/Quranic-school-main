import { Card, FeatureList } from '../../../components/UI';
import { Check, X } from 'lucide-react';

const UsageRulesCard = () => {
  return (
    <Card
      variant="default"
      padding="lg"
      className="bg-white/80 backdrop-blur border border-blue-100"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xl">⚖️</span>
        <h2 className="text-2xl font-bold text-blue-800">قواعد الاستخدام</h2>
      </div>
      <div className="space-y-4">
        {/* Allowed Section */}
        <Card variant="gradient" padding="md" className="bg-blue-50">
          <h3 className="font-semibold text-blue-800 mb-2">المسموح:</h3>
          <FeatureList
            align="start"
            className="!text-gray-700"
            items={[
              {
                icon: <Check className="w-5 h-5 text-blue-600" />,
                text: 'استخدام المنصة للدراسة ومراجعة المواد التعليمية',
              },
              {
                icon: <Check className="w-5 h-5 text-blue-600" />,
                text: 'المشاركة في الأنشطة والاختبارات التفاعلية',
              },
              {
                icon: <Check className="w-5 h-5 text-blue-600" />,
                text: 'التواصل مع المعلمين والطلاب بشكل محترم',
              },
              {
                icon: <Check className="w-5 h-5 text-blue-600" />,
                text: 'تحميل الملفات والمواد المصرح بها',
              },
            ]}
          />
        </Card>

        {/* Prohibited Section */}
        <Card variant="gradient" padding="md" className="bg-red-50">
          <h3 className="font-semibold text-red-800 mb-2">الممنوع:</h3>
          <FeatureList
            align="start"
            className="!text-gray-700"
            items={[
              {
                icon: <X className="w-5 h-5 text-red-600" />,
                text: 'نشر محتوى مسيء أو غير لائق أو مخالف للتعاليم الإسلامية',
              },
              {
                icon: <X className="w-5 h-5 text-red-600" />,
                text: 'مشاركة بيانات تسجيل الدخول مع أشخاص آخرين',
              },
              {
                icon: <X className="w-5 h-5 text-red-600" />,
                text: 'محاولة اختراق النظام أو الوصول غير المصرح به',
              },
              {
                icon: <X className="w-5 h-5 text-red-600" />,
                text: 'استخدام المنصة لأغراض تجارية أو دعائية',
              },
            ]}
          />
        </Card>
      </div>
    </Card>
  );
};

export default UsageRulesCard;
