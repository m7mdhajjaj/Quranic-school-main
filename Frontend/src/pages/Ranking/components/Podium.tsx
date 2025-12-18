/**
 * Podium Component
 * Olympic-style podium for top 3 students
 */

import type { PodiumProps } from "../types/ranking";
import { getFullName } from "../utils/rankingHelpers";

export const Podium = ({ topThreeStudents }: PodiumProps) => {
  // Medal colors as Tailwind classes
  const getMedalClasses = (rank: number) => {
    if (rank === 1) return {
      border: "border-yellow-400",
      bg: "bg-yellow-400",
      text: "text-yellow-500"
    };
    if (rank === 2) return {
      border: "border-gray-400",
      bg: "bg-gray-400",
      text: "text-gray-500"
    };
    if (rank === 3) return {
      border: "border-orange-600",
      bg: "bg-orange-600",
      text: "text-orange-600"
    };
    return {
      border: "border-gray-300",
      bg: "bg-gray-300",
      text: "text-gray-400"
    };
  };

  return (
    <div className="mx-2 sm:mx-10 md:mx-20 my-8 sm:my-12 md:my-20 relative" data-aos="fade-up">
      <div className="flex flex-col sm:flex-row justify-center items-center sm:items-end min-h-[400px] sm:h-96 mb-8 gap-4 sm:gap-0">
        {/* Second place - left */}
        {topThreeStudents[1] && (
          <div
            className="w-full sm:w-1/4 flex flex-col items-center mx-0 sm:mx-2 order-2 sm:order-1"
            data-aos="fade-up"
            data-aos-delay="200">
            <div className="relative">
              <div className={`w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-white border-4 mb-4 flex items-center justify-center shadow-lg ${getMedalClasses(2).border}`}>
                <div className={`font-bold text-3xl sm:text-4xl ${getMedalClasses(2).text}`}>2</div>
              </div>
              <div className={`absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${getMedalClasses(2).bg}`}>
                2
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-base sm:text-lg">
                {getFullName(topThreeStudents[1])}
              </h3>
              <p className="text-emerald-700 font-semibold text-sm sm:text-base">
                {topThreeStudents[1].overallAverage.toFixed(1)}%
              </p>
            </div>
            <div className={`w-full sm:w-full h-32 sm:h-40 rounded-t-lg mt-4 flex items-center justify-center ${getMedalClasses(2).bg}`}>
              <span className="text-2xl sm:text-3xl font-bold text-white">2</span>
            </div>
          </div>
        )}

        {/* First place - center */}
        {topThreeStudents[0] && (
          <div
            className="w-full sm:w-1/3 flex flex-col items-center mx-0 sm:mx-2 mt-0 sm:-mt-10 order-1 sm:order-2"
            data-aos="fade-up"
            data-aos-delay="100">
            <div className="relative">
              <div className={`w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full bg-white border-4 mb-4 flex items-center justify-center shadow-lg ${getMedalClasses(1).border}`}>
                <div className={`font-bold text-4xl sm:text-5xl ${getMedalClasses(1).text}`}>1</div>
              </div>
              <div className={`absolute -top-4 -right-2 sm:-top-5 sm:-right-3 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-lg sm:text-xl ${getMedalClasses(1).bg}`}>
                1
              </div>
              <div className="absolute top-0 left-0 right-0 -mt-6 sm:-mt-8 flex justify-center">
                <svg
                  className={`w-8 h-8 sm:w-10 sm:h-10 ${getMedalClasses(1).text}`}
                  fill="currentColor"
                  viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-lg sm:text-xl">
                {getFullName(topThreeStudents[0])}
              </h3>
              <p className="text-emerald-700 font-bold text-base sm:text-lg">
                {topThreeStudents[0].overallAverage.toFixed(1)}%
              </p>
            </div>
            <div className={`w-full h-40 sm:h-52 rounded-t-lg mt-4 flex items-center justify-center ${getMedalClasses(1).bg}`}>
              <span className="text-3xl sm:text-4xl font-bold text-white">1</span>
            </div>
          </div>
        )}

        {/* Third place - right */}
        {topThreeStudents[2] && (
          <div
            className="w-full sm:w-1/4 flex flex-col items-center mx-0 sm:mx-2 order-3"
            data-aos="fade-up"
            data-aos-delay="300">
            <div className="relative">
              <div className={`w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-white border-4 mb-4 flex items-center justify-center shadow-lg ${getMedalClasses(3).border}`}>
                <div className={`font-bold text-3xl sm:text-4xl ${getMedalClasses(3).text}`}>3</div>
              </div>
              <div className={`absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${getMedalClasses(3).bg}`}>
                3
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-base sm:text-lg">
                {getFullName(topThreeStudents[2])}
              </h3>
              <p className="text-emerald-700 font-semibold text-sm sm:text-base">
                {topThreeStudents[2].overallAverage.toFixed(1)}%
              </p>
            </div>
            <div className={`w-full sm:w-full h-28 sm:h-32 rounded-t-lg mt-4 flex items-center justify-center ${getMedalClasses(3).bg}`}>
              <span className="text-2xl sm:text-3xl font-bold text-white">3</span>
            </div>
          </div>
        )}
      </div>
      <div className="h-4 sm:h-6 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-lg shadow-lg"></div>
    </div>
  );
};
