import { CheckCircle, Key } from 'lucide-react';

interface StepsIndicatorProps {
  currentStep: 1 | 2;
}

export const StepsIndicator = ({ currentStep }: StepsIndicatorProps) => {
  return (
    <div className="flex items-center justify-center gap-6 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-2xl p-4 shadow-inner">
      {/* Step 1 */}
      <div className="flex flex-col items-center gap-2 flex-1">
        <div
          className={`relative transition-all duration-500 ${currentStep >= 1 ? 'scale-110' : 'scale-100'}`}
        >
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg transition-all duration-500 ${
              currentStep >= 1
                ? 'bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-700 text-white shadow-emerald-300'
                : 'bg-white text-gray-400 border-2 border-gray-300'
            }`}
          >
            {currentStep > 1 ? (
              <CheckCircle className="w-7 h-7" />
            ) : (
              <span>1</span>
            )}
          </div>
          {currentStep >= 1 && (
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl blur opacity-30 animate-pulse"></div>
          )}
        </div>
        <div className="text-center">
          <p
            className={`font-bold text-base transition-colors duration-300 ${currentStep >= 1 ? 'text-emerald-600' : 'text-gray-400'}`}
          >
            التحقق من الهوية
          </p>
          <p className="text-xs text-gray-500">أدخل بياناتك الشخصية</p>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center justify-center">
        <div
          className={`h-2 w-32 rounded-full transition-all duration-700 relative shadow-sm ${
            currentStep >= 2
              ? 'bg-gradient-to-l from-emerald-600 via-teal-700 to-slate-700'
              : 'bg-gray-300'
          }`}
        >
          <div
            className={`h-full rounded-full transition-all duration-700 absolute left-0 ${
              currentStep >= 2 ? 'bg-white w-1/2 animate-shimmer shadow-md' : 'w-0'
            }`}
          ></div>
        </div>
      </div>

      {/* Step 2 */}
      <div className="flex flex-col items-center gap-2 flex-1">
        <div
          className={`relative transition-all duration-500 ${currentStep >= 2 ? 'scale-110' : 'scale-100'}`}
        >
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg transition-all duration-500 ${
              currentStep >= 2
                ? 'bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-700 text-white shadow-emerald-300'
                : 'bg-white text-gray-400 border-2 border-gray-300'
            }`}
          >
            {currentStep >= 2 ? <Key className="w-7 h-7" /> : <span>2</span>}
          </div>
          {currentStep >= 2 && (
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl blur opacity-30 animate-pulse"></div>
          )}
        </div>
        <div className="text-center">
          <p
            className={`font-bold text-base transition-colors duration-300 ${currentStep >= 2 ? 'text-emerald-600' : 'text-gray-400'}`}
          >
            كلمة المرور الجديدة
          </p>
          <p className="text-xs text-gray-500">إنشاء كلمة مرور آمنة</p>
        </div>
      </div>
    </div>
  );
};
