import type { FC } from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageListProps {
  errors: string[];
}

const ErrorMessageList: FC<ErrorMessageListProps> = ({ errors }) => {
  if (errors.length === 0) return null;

  return (
    <div className="rounded-xl border border-red-100 bg-red-50/50 p-4 shadow-sm backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-red-100 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600" />
        </div>
        <h4 className="text-sm font-bold text-gray-800">تنبيهات النظام ({errors.length})</h4>
      </div>
      
      <div className="space-y-2">
        {errors.map((err, idx) => (
          <div 
            key={idx} 
            className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-100/50 shadow-sm"
          >
            <span className="mt-1.5 flex h-2 w-2 shrink-0 rounded-full bg-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.2)]" />
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              {err.replace('🚫', '')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ErrorMessageList;
