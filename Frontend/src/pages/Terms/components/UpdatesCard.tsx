import { Card } from '../../../components/shared';

const UpdatesCard = () => {
  return (
    <Card
      variant="default"
      padding="lg"
      className="bg-white/80 backdrop-blur border border-blue-100"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xl">🔄</span>
        <h2 className="text-2xl font-bold text-blue-800">
          التحديثات والتغييرات
        </h2>
      </div>
      <Card
        variant="gradient"
        padding="md"
        className="bg-yellow-50"
      >
        <p className="text-gray-700 leading-relaxed">
          تحتفظ إدارة المدرسة بالحق في تحديث هذه الشروط والأحكام في أي وقت. سيتم
          إشعار المستخدمين بأي تغييرات مهمة، وسيكون استمرار استخدام المنصة بمثابة
          موافقة على الشروط المحدثة.
        </p>
      </Card>
    </Card>
  );
};

export default UpdatesCard;
