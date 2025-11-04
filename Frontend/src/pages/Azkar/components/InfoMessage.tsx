import { Card } from "@/components/UI";

const InfoMessage = () => {
  return (
    <Card
      variant="gradient"
      padding="lg"
      className="max-w-3xl mx-auto bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 mb-8">
      <div className="flex items-start gap-4">
        <div className="text-4xl flex-shrink-0 animate-pulse">📿</div>
        <div className="text-right flex-1">
          <h3 className="text-xl font-bold text-emerald-800 mb-2">
            أذكار مختصرة للطلاب
          </h3>
          <p className="text-gray-700 leading-relaxed">
            هذه مجموعة مختارة من الأذكار بأعداد مناسبة لتسهيل الالتزام بها
            يومياً. نسأل الله أن يعيننا وإياكم على ذكره وشكره وحسن عبادته 🤲
          </p>
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-emerald-700 font-medium">
            <span>✨</span>
            <span>اجعل الأذكار عادة يومية تنير قلبك وتحصّن نفسك</span>
            <span>✨</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InfoMessage;
