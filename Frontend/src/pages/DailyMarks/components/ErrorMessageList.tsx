import React, { FC } from 'react';

interface ErrorMessageListProps {
  errors: string[];
}

const ErrorMessageList: FC<ErrorMessageListProps> = ({ errors }) => {
  if (errors.length === 0) return null;

  return (
    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm transition-all duration-300">
      <div className="flex items-center gap-2 mb-2 text-red-800 font-bold border-b border-red-100 pb-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <span>تنبيهات النظام</span>
      </div>
      <ul className="space-y-1">
        {errors.map((err, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-red-700 animate-fadeIn">
            <span className="mt-1 block h-1 w-1 rounded-full bg-red-400" />
            <span>{err.replace('🚫', '')}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ErrorMessageList;
