import { Lock } from 'lucide-react';

interface ModalHeaderProps {
  currentStep: 1 | 2;
  onClose: () => void;
}

export const ModalHeader = ({ currentStep, onClose }: ModalHeaderProps) => {
  return (
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-700 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
          <Lock className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 bg-clip-text text-transparent">
            استعادة كلمة المرور
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {currentStep === 1
              ? 'التحقق من هويتك للمتابعة'
              : 'إنشاء كلمة مرور جديدة وآمنة'}
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-all duration-300 p-2.5 rounded-xl hover:bg-gray-100 hover:rotate-90 transform"
        aria-label="إغلاق"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};
