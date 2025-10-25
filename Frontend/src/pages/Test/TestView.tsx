// ============================================================================
// TestView - واجهة الاختبار
// ============================================================================

import type { TestViewProps } from "./types/test";
import { Timer, ProgressBar } from "./components";
import { getTestEncouragementMessage } from "./utils/testHelpers";

export const TestView: React.FC<TestViewProps> = ({
  questions,
  currentQuestionIndex,
  score,
  selectedAnswer,
  hasAnswered,
  questionTimer,
  onSelectAnswer,
}) => {
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8"
      dir="rtl">
      <div className="max-w-3xl mx-auto">
        {/* شريط التقدم */}
        <ProgressBar
          current={currentQuestionIndex}
          total={questions.length}
          score={score}
        />

        {/* المؤقت */}
        <Timer timer={questionTimer} isActive={true} />

        {/* بطاقة السؤال */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-6 md:p-8 mb-6 border border-blue-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
              سؤال {currentQuestionIndex + 1}
            </div>
            <div className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium border border-amber-200">
              📖 اختبار قرآني
            </div>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 leading-relaxed">
            {currentQuestion.question}
          </h2>

          {currentQuestion.context && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-5 rounded-2xl mb-6 border-r-4 border-emerald-500 shadow-md">
              <div className="flex items-start gap-2">
                <span className="text-2xl">📜</span>
                <p className="text-gray-700 leading-loose font-arabic text-lg">
                  {currentQuestion.context}
                </p>
              </div>
            </div>
          )}

          {/* خيارات الإجابة */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              const isWrong = hasAnswered && isSelected && !isCorrect;
              const shouldShowCorrect = hasAnswered && isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => onSelectAnswer(index)}
                  disabled={hasAnswered}
                  className={`group w-full p-4 md:p-5 text-right rounded-2xl border-2 transition-all duration-300 font-medium text-base md:text-lg ${
                    shouldShowCorrect
                      ? "bg-gradient-to-r from-emerald-100 to-teal-100 border-emerald-500 text-emerald-800 shadow-lg scale-105"
                      : isWrong
                      ? "bg-gradient-to-r from-red-100 to-pink-100 border-red-500 text-red-800 shadow-lg"
                      : isSelected
                      ? "bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-500 text-blue-800"
                      : "bg-white border-gray-300 hover:border-indigo-400 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:shadow-md hover:-translate-y-0.5"
                  } ${hasAnswered ? "cursor-default" : "cursor-pointer"}`}>
                  <div className="flex items-center justify-between">
                    <span className="flex-1">{option}</span>
                    {shouldShowCorrect && (
                      <span className="text-2xl mr-2 animate-bounce">✓</span>
                    )}
                    {isWrong && <span className="text-2xl mr-2">✗</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* رسالة تشجيعية */}
        {!hasAnswered && questionTimer <= 10 && (
          <div className="text-center">
            <div className="inline-block bg-gradient-to-r from-yellow-100 to-orange-100 px-6 py-3 rounded-full border border-yellow-300 shadow-md">
              <span className="text-gray-700 font-medium">
                {getTestEncouragementMessage(questionTimer)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
