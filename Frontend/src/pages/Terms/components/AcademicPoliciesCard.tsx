import { Card, FeatureList } from '../../../components/UI';
import { CheckCircle, AlertCircle } from 'lucide-react';

const AcademicPoliciesCard = () => {
  return (
    <Card
      variant="default"
      padding="lg"
      className="bg-white/80 backdrop-blur border border-blue-100"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xl">🎓</span>
        <h2 className="text-2xl font-bold text-blue-800">
          السياسات الأكاديمية
        </h2>
      </div>
      <div className="space-y-4">
        {/* Attendance Section */}
        <Card variant="gradient" padding="md" className="bg-emerald-50">
          <h3 className="font-semibold text-emerald-800 mb-2">
            الحضور والغياب:
          </h3>
          <FeatureList
            align="start"
            className="!text-gray-700"
            items={[
              {
                icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
                text: 'يجب على الطلاب الحضور في المواعيد المحددة',
              },
              {
                icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
                text: 'الإبلاغ عن الغياب مسبقاً في حالات الضرورة',
              },
              {
                icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
                text: 'متابعة الدروس المفقودة والتعويض عنها',
              },
            ]}
          />
        </Card>

        {/* Assessment Section */}
        <Card variant="gradient" padding="md" className="bg-purple-50">
          <h3 className="font-semibold text-purple-800 mb-2">
            التقييم والاختبارات:
          </h3>
          <FeatureList
            align="start"
            className="!text-gray-700"
            items={[
              {
                icon: <AlertCircle className="w-5 h-5 text-purple-600" />,
                text: 'أداء جميع الاختبارات والواجبات في الوقت المحدد',
              },
              {
                icon: <AlertCircle className="w-5 h-5 text-purple-600" />,
                text: 'عدم الغش أو محاولة الحصول على إجابات بطرق غير مشروعة',
              },
              {
                icon: <AlertCircle className="w-5 h-5 text-purple-600" />,
                text: 'احترام نتائج التقييم والعمل على التحسن المستمر',
              },
            ]}
          />
        </Card>
      </div>
    </Card>
  );
};

export default AcademicPoliciesCard;
