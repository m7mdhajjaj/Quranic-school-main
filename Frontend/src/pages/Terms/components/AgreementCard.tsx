import { Card } from '../../../components/shared';

const AgreementCard = () => {
  return (
    <Card
      variant="gradient"
      padding="lg"
      className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white relative overflow-hidden"
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

      <div className="text-center relative z-10">
        <Card
          variant="gradient"
          padding="md"
          className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm mb-6 shadow-lg"
        >
          <span className="text-3xl filter drop-shadow-sm">✍️</span>
        </Card>
        
        <h2 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-sm">
          الموافقة والتواصل
        </h2>
        
        <Card
          variant="gradient"
          padding="lg"
          className="bg-white/90 backdrop-blur-md mb-6 border border-white/30 shadow-lg"
        >
          <p className="text-lg md:text-xl leading-relaxed font-semibold text-gray-900">
            باستخدامك لهذه المنصة التعليمية المباركة، فإنك تقر وتؤكد بأنك قد قرأت
            جميع الشروط والأحكام بعناية، وفهمت مضمونها بالكامل، ووافقت عليها
            طواعية وبكامل الأهلية القانونية
          </p>
        </Card>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Card
            variant="gradient"
            padding="sm"
            className="bg-white/90 backdrop-blur-sm border border-white/30"
          >
            <p className="text-sm font-medium text-gray-900">آخر تحديث: أكتوبر 2025</p>
          </Card>
          
          <Card
            variant="gradient"
            padding="sm"
            className="bg-white/90 backdrop-blur-sm border border-white/30"
          >
            <p className="text-sm font-medium text-gray-900">للاستفسارات: تواصل مع الإدارة</p>
          </Card>
        </div>
      </div>
    </Card>
  );
};

export default AgreementCard;
