interface SocketIndicatorProps {
  socketConnected: boolean;
  socketId?: string | null;
  socketLastUpdate?: Date | null;
}

const SocketIndicator = ({ 
  socketConnected, 
  socketId, 
  socketLastUpdate 
}: SocketIndicatorProps) => {
  // Only show in development mode
  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed top-20 left-4 z-50">
      <div className="relative group">
        {/* Socket Status Indicator */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              socketConnected 
                ? 'bg-emerald-500 shadow-emerald-500/50 shadow-lg animate-pulse' 
                : 'bg-red-500 shadow-red-500/50 shadow-lg'
            }`}
          />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {socketConnected ? 'متصل' : 'غير متصل'}
          </span>
        </div>

        {/* Hover Details Tooltip */}
        <div className="absolute left-0 top-full mt-2 bg-gray-900 text-white text-xs py-3 px-4 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-xl min-w-[200px]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-700">
              <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className="font-semibold">
                {socketConnected ? '✓ اتصال نشط' : '✗ غير متصل'}
              </span>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">الغرفة:</span>
                <span className="text-emerald-400 font-mono">news</span>
              </div>
              
              {socketId && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Socket ID:</span>
                  <span className="text-blue-400 font-mono text-[10px]">
                    {socketId.slice(0, 8)}...
                  </span>
                </div>
              )}
              
              {socketLastUpdate && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">آخر تحديث:</span>
                  <span className="text-purple-400 font-mono text-[10px]">
                    {new Date(socketLastUpdate).toLocaleTimeString('ar-EG')}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 mt-2 border-t border-gray-700">
              <div className="text-[10px] text-gray-500">
                🔌 Real-time updates enabled
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocketIndicator;
