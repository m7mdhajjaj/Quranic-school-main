import React from 'react';

export const SocketIndicator: React.FC<{
  isConnected?: boolean;
  socketId?: string | null;
  lastUpdate?: number | null;
}> = ({ isConnected, socketId, lastUpdate }) => {
  if (!import.meta.env.DEV) return null;
  return (
    <div className="fixed top-20 left-4 z-50">
      <div className="relative group">
        <div
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-yellow-500'
          }`}
        />
        <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
          <div className="font-semibold mb-1">
            {isConnected ? '✓ متصل بالسوكت' : '⚠ غير متصل'}
          </div>
          {socketId && (
            <div className="text-gray-300 text-[10px] mb-1">ID: {socketId.slice(0, 8)}...</div>
          )}
          {lastUpdate && (
            <div className="text-gray-400 text-[10px]">
              آخر تحديث: {new Date(lastUpdate).toLocaleTimeString('ar-EG')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
