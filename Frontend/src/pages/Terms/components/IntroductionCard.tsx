import { Card } from '../../../components/shared';

interface IntroductionCardProps {
  icon?: string;
  title?: string;
  content?: string;
  highlightText?: string;
  colorScheme?: 'blue' | 'emerald' | 'purple' | 'teal';
}

const IntroductionCard = ({
  icon = '📝',
  title = 'مقدمة',
  content = 'أهلاً وسهلاً بك في مدرسة القرآن الكريم، منصتك التعليمية المتخصصة في علوم القرآن والتربية الإسلامية. باستخدامك لهذه المنصة التعليمية المتطورة، فإنك تقبل وتوافق على الالتزام الكامل بجميع الشروط والأحكام التالية. نرجو منك قراءة هذه الشروط بعناية فائقة وتمعن قبل المتابعة في استخدام موقعنا ومنصتنا التعليمية.',
  highlightText = 'مدرسة القرآن الكريم',
  colorScheme = 'blue',
}: IntroductionCardProps) => {
  const colorSchemes = {
    blue: {
      border: 'border-blue-100',
      iconGradient: 'from-blue-500 to-indigo-500',
      titleColor: 'text-blue-800',
      titleHover: 'group-hover:text-blue-700',
      contentBg: 'from-blue-50 to-indigo-50',
      contentBorder: 'border-blue-500',
      highlightText: 'text-blue-700',
      highlightBg: 'bg-blue-100',
    },
    emerald: {
      border: 'border-emerald-100',
      iconGradient: 'from-emerald-500 to-teal-500',
      titleColor: 'text-emerald-800',
      titleHover: 'group-hover:text-emerald-700',
      contentBg: 'from-emerald-50 to-teal-50',
      contentBorder: 'border-emerald-500',
      highlightText: 'text-emerald-700',
      highlightBg: 'bg-emerald-100',
    },
    purple: {
      border: 'border-purple-100',
      iconGradient: 'from-purple-500 to-pink-500',
      titleColor: 'text-purple-800',
      titleHover: 'group-hover:text-purple-700',
      contentBg: 'from-purple-50 to-pink-50',
      contentBorder: 'border-purple-500',
      highlightText: 'text-purple-700',
      highlightBg: 'bg-purple-100',
    },
    teal: {
      border: 'border-teal-100',
      iconGradient: 'from-teal-500 to-cyan-500',
      titleColor: 'text-teal-800',
      titleHover: 'group-hover:text-teal-700',
      contentBg: 'from-teal-50 to-cyan-50',
      contentBorder: 'border-teal-500',
      highlightText: 'text-teal-700',
      highlightBg: 'bg-teal-100',
    },
  };

  const colors = colorSchemes[colorScheme];

  return (
    <Card
      variant="default"
      padding="lg"
      hover
      className={`group bg-white/90 backdrop-blur-md border ${colors.border}`}
    >
      <div className="flex items-center gap-4 mb-6">
        <div
          className={`flex items-center justify-center w-12 h-12 bg-gradient-to-br ${colors.iconGradient} rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300`}
        >
          <span className="text-2xl filter drop-shadow-sm">{icon}</span>
        </div>
        <h2
          className={`text-3xl md:text-4xl font-bold ${colors.titleColor} ${colors.titleHover} transition-colors duration-300`}
        >
          {title}
        </h2>
      </div>
      <Card
        variant="gradient"
        padding="lg"
        className={`bg-gradient-to-l ${colors.contentBg} border-r-4 ${colors.contentBorder}`}
      >
        <p className="text-gray-800 leading-loose text-lg md:text-xl font-medium">
          {content.split(highlightText).map((part, index, array) => (
            <span key={index}>
              {part}
              {index < array.length - 1 && (
                <span
                  className={`font-bold ${colors.highlightText} ${colors.highlightBg} px-2 py-1 rounded-lg`}
                >
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
