import React from "react";
import { FaPlus, FaDownload, FaUserTie } from "react-icons/fa";
import { Button } from "@/components/UI";

interface TeachersHeaderProps {
  isConnected: boolean;
  socketLastUpdate: Date | null;
  socketId: string | null;
  onAddTeacher: () => void;
  onExport: () => void;
  hasTeachers: boolean;
}

const TeachersHeader: React.FC<TeachersHeaderProps> = ({
  isConnected,
  socketLastUpdate,
  socketId,
  onAddTeacher,
  onExport,
  hasTeachers,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-xl">
            <FaUserTie className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                إدارة المعلمين
              </h1>
            </div>
            <div className="flex items-center gap-2 text-sm mt-1">
              <p className="text-gray-600">
                نظام متكامل لإدارة بيانات المعلمين
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

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={onExport}
            disabled={!hasTeachers}
            variant="secondary"
            size="md"
            leftIcon={<FaDownload />}
            className="shadow-lg">
            <span className="hidden sm:inline">تصدير</span>
          </Button>

          <Button
            onClick={onAddTeacher}
            variant="primary"
            size="md"
            leftIcon={<FaPlus />}
            className="shadow-lg">
            إضافة معلم
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TeachersHeader;
