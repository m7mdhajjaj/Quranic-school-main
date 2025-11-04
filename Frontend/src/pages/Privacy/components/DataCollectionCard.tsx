import { Card, FeatureList } from "@/components/UI";
import { Database, Target } from 'lucide-react';

const DataCollectionCard = () => {
  return (
    <Card
      variant="default"
      padding="lg"
      className="bg-white/80 backdrop-blur border border-emerald-100"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xl">📄</span>
        <h2 className="text-2xl font-bold text-emerald-800">جمع البيانات</h2>
      </div>
      <div className="space-y-4">
        {/* Data We Collect */}
        <Card variant="gradient" padding="md" className="bg-emerald-50">
          <h3 className="font-semibold text-emerald-800 mb-2">
            البيانات التي نجمعها:
          </h3>
          <FeatureList
            align="start"
            className="!text-gray-700"
            items={[
              {
                icon: <Database className="w-5 h-5 text-emerald-600" />,
                text: 'الاسم ومعلومات التواصل (البريد الإلكتروني، رقم الهاتف)',
              },
              {
                icon: <Database className="w-5 h-5 text-emerald-600" />,
                text: 'بيانات الحضور والغياب والدرجات',
              },
              {
                icon: <Database className="w-5 h-5 text-emerald-600" />,
                text: 'تفاعلك مع المنصة (الاختبارات، الأنشطة، التقارير)',
              },
              {
                icon: <Database className="w-5 h-5 text-emerald-600" />,
                text: 'معلومات تقنية (عنوان IP، نوع المتصفح، تاريخ الزيارة)',
              },
            ]}
          />
        </Card>

        {/* Purpose of Collection */}
        <Card variant="gradient" padding="md" className="bg-blue-50">
          <h3 className="font-semibold text-blue-800 mb-2">
            الغرض من جمع البيانات:
          </h3>
          <FeatureList
            align="start"
            className="!text-gray-700"
            items={[
              {
                icon: <Target className="w-5 h-5 text-blue-600" />,
                text: 'تقديم خدمات تعليمية مخصصة وفعالة',
              },
              {
                icon: <Target className="w-5 h-5 text-blue-600" />,
                text: 'تحسين جودة التعليم ومتابعة التقدم',
              },
              {
                icon: <Target className="w-5 h-5 text-blue-600" />,
                text: 'ضمان أمان المنصة ومنع الاستخدام غير المشروع',
              },
              {
                icon: <Target className="w-5 h-5 text-blue-600" />,
                text: 'التواصل مع الطلاب وأولياء الأمور',
              },
            ]}
          />
        </Card>
      </div>
    </Card>
  );
};

export default DataCollectionCard;
