import React from "react";
import { FaUsers, FaPlus, FaDownload } from "react-icons/fa";

interface GroupsHeaderProps {
  isConnected: boolean;
  socketId: string | null;
  socketLastUpdate: Date | null;
  onAddClick: () => void;
  onExport: () => void;
  hasGroups: boolean;
}

export const GroupsHeader: React.FC<GroupsHeaderProps> = ({
  isConnected,
  socketId,
  socketLastUpdate,
  onAddClick,
  onExport,
  hasGroups,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 text-right">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-xl">
              <FaUsers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                إدارة الحلقات
              </h1>
              <div className="flex items-center gap-2 text-sm mt-1">
                <p className="text-gray-600">
                  إدارة وتنظيم حلقات تحفيظ القرآن الكريم
                </p>
                <div
                  className="flex items-center gap-1.5 cursor-help"
                  title={
                    isConnected
                      ? `💓 Heartbeat نشط (كل 30 ثانية)\nSocket ID: ${
                          socketId || "N/A"
                        }\nآخر تحديث: ${
                          socketLastUpdate?.toLocaleTimeString("ar-SA") || "N/A"
                        }`
                      : "Socket غير متصل - وضع التحديث التلقائي"
                  }>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? "bg-green-500" : "bg-yellow-500"
                    } animate-pulse`}></div>
                  <span
                    className={`text-xs font-medium ${
                      isConnected ? "text-green-600" : "text-yellow-600"
                    }`}>
                    {isConnected ? "💓 متصل مباشرة" : "تحديث تلقائي"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onExport}
            disabled={!hasGroups}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed">
            <FaDownload className="w-4 h-4" />
            تصدير
          </button>

          <button
            onClick={onAddClick}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg">
            <FaPlus className="w-4 h-4" />
            إضافة حلقة جديدة
          </button>
        </div>
      </div>
    </div>
  );
};
