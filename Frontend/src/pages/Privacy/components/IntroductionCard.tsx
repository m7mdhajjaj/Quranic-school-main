import { Card } from '../../../components/UI';

interface IntroductionCardProps {
  icon?: string;
  title?: string;
  content?: string;
  highlightText?: string;
}

const IntroductionCard = ({
  icon = '👁️',
  title = 'مقدمة',
  content = 'نحن في مدرسة القرآن الكريم نقدر ثقتك ونعتبرها أمانة في عنقنا. نلتزم بحماية خصوصية وبيانات جميع المستخدمين بأعلى معايير الأمان العالمية. هذه السياسة توضح بشفافية كاملة كيف نجمع ونستخدم ونحمي بياناتك الشخصية عند استخدام منصتنا التعليمية المتطورة.',
  highlightText = 'مدرسة القرآن الكريم',
}: IntroductionCardProps) => {
  return (
    <Card
      variant="default"
      padding="lg"
      hover
      className="group bg-white/90 backdrop-blur-md border border-emerald-100"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
          <span className="text-2xl filter drop-shadow-sm">{icon}</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-emerald-800 group-hover:text-emerald-700 transition-colors duration-300">
          {title}
        </h2>
      </div>
      <Card
        variant="gradient"
        padding="lg"
        className="bg-gradient-to-l from-emerald-50 to-teal-50 border-r-4 border-emerald-500"
      >
        <p className="text-gray-800 leading-loose text-lg md:text-xl font-medium">
          {content.split(highlightText).map((part, index, array) => (
            <span key={index}>
              {part}
              {index < array.length - 1 && (
                <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg">
                  {highlightText}
                </span>
              )}
            </span>
          ))}
        </p>
      </Card>
    </Card>
  );
};

export default IntroductionCard;
