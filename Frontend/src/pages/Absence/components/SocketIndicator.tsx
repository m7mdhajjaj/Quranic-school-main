// components/SocketIndicator.tsx
interface SocketIndicatorProps {
  socketConnected: boolean;
  socketId?: string;
  socketLastUpdate?: number | null;
}

export const SocketIndicator = ({
  socketConnected,
  socketId,
  socketLastUpdate,
}: SocketIndicatorProps) => {
  return (
    <div className="relative group">
      <div
        className={`w-3 h-3 rounded-full ${
          socketConnected ? "bg-green-500" : "bg-yellow-500"
        } animate-pulse`}
        title={socketConnected ? "متصل" : "غير متصل"}
      />
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
        <div className="text-center">
          <div className="font-semibold mb-1">
            {socketConnected ? "✓ متصل بالسوكت" : "⚠ غير متصل"}
          </div>
          {socketId && (
            <div className="text-gray-300 text-xs">
              ID: {socketId.substring(0, 8)}...
            </div>
          )}
          {socketLastUpdate && (
            <div className="text-gray-300 text-xs mt-1">
              آخر تحديث:{" "}
              {new Date(socketLastUpdate).toLocaleTimeString("ar-EG")}
            </div>
          )}
          <div className="text-gray-400 text-xs mt-1 border-t border-gray-600 pt-1">
            اضغط 'd' للإخفاء
          </div>
        </div>
        {/* Arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
      </div>
    </div>
  );
};
