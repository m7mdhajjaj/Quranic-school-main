// components/SocketIndicator.tsx
interface SocketIndicatorProps {
  socketConnected: boolean;
  socketId: string | null;
  socketLastUpdate: Date | null;
}

export const SocketIndicator = ({
  socketConnected,
  socketId,
  socketLastUpdate,
}: SocketIndicatorProps) => {
  // Only show in development mode
  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed top-20 left-4 z-50">
      <div className="relative group">
        <div
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            socketConnected ? "bg-emerald-500 animate-pulse" : "bg-yellow-500"
          }`}
        />
        <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
          <div className="font-semibold mb-1">
            {socketConnected ? "✓ متصل بالسوكت" : "⚠ غير متصل"}
          </div>
          {socketId && (
            <div className="text-gray-300 text-[10px] mb-1">
              ID: {socketId.slice(0, 8)}...
            </div>
          )}
          {socketLastUpdate && (
            <div className="text-gray-400 text-[10px]">
              آخر تحديث:{" "}
              {new Date(socketLastUpdate).toLocaleTimeString("ar-EG")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
