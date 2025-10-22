import React from "react";

const TestQuestionSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar Skeleton */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
            <div className="flex items-center space-x-4">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-12"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2 animate-pulse"></div>
          <div className="w-full bg-gray-200 rounded-full h-1 animate-pulse"></div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Question Preparation Skeleton */}
          <div className="text-center mb-6">
            <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-40 mx-auto"></div>
          </div>

          {/* Question Section Skeleton */}
          <div className="mb-6">
            <div className="h-6 bg-gray-200 rounded-full animate-pulse w-24 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-full mb-4"></div>

            {/* Context Box Skeleton */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-full"></div>
                <div className="h-5 bg-gray-200 rounded animate-pulse w-5/6"></div>
              </div>
            </div>
          </div>

          {/* Answer Options Skeleton */}
          <div className="space-y-3 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-full p-4 border-2 border-gray-200 rounded-xl bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-4 mr-2"></div>
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-48"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Button Skeleton */}
          <div className="h-12 bg-gray-200 rounded-xl animate-pulse w-full"></div>
        </div>
      </div>
    </div>
  );
};

export default TestQuestionSkeleton;
