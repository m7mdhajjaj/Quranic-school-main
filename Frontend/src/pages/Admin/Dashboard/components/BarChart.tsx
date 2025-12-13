import React from "react";
import type { BarChartProps } from "../types";
import { DEFAULT_BAR_COLORS } from "../Types/constants";

export const BarChart: React.FC<BarChartProps> = ({
  data,
  labels,
  colors = ["bg-gradient-to-t from-blue-500 to-blue-600"],
  maxValue = 100,
}) => {
  // حسابات بسيطة للعرض فقط (presentation logic)
  const max = Math.max(...data, maxValue);
  const total = data.reduce((sum, val) => sum + val, 0);

  // تحديد عدد الأعمدة بناءً على عدد البيانات
  const columnCount = data.length;
  const gap = columnCount > 8 ? 2 : columnCount > 5 ? 3 : 4;

  return (
    <div className="h-full w-full">
      <div className="h-full flex items-end justify-center gap-2 px-2 overflow-x-auto">
        {data.map((value, i) => {
          const heightPercent = (value / max) * 100;
          const percentage = total > 0 ? (value / total) * 100 : 0;
          const color = colors[i] || DEFAULT_BAR_COLORS[i % DEFAULT_BAR_COLORS.length];

          return (
            <div
              key={i}
              className="flex flex-col items-center group relative"
              style={{
                minWidth: columnCount > 8 ? "60px" : columnCount > 5 ? "70px" : "80px",
                maxWidth: columnCount > 8 ? "80px" : columnCount > 5 ? "100px" : "120px",
                flex: "1 1 auto",
              }}>
              {/* النسبة المئوية عند hover */}
              <div className="mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-1 z-10">
                <span className="text-xs font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 px-3 py-1.5 rounded-lg shadow-lg border border-white/20 whitespace-nowrap">
                  {percentage.toFixed(1)}%
                </span>
              </div>

              <div className="w-full bg-gray-100 rounded-2xl relative overflow-hidden shadow-inner" style={{ height: "200px" }}>
                <div
                  className={`${color} rounded-2xl absolute bottom-0 w-full transition-all duration-1000 hover:opacity-90 flex items-center justify-center group-hover:shadow-xl transform group-hover:scale-[1.02]`}
                  style={{
                    height: `${Math.max(heightPercent, 8)}%`,
                    animationDelay: `${i * 200}ms`,
                  }}>
                  {/* القيمة */}
                  {heightPercent > 15 && (
                    <div className="text-center text-white">
                      <div className="font-bold text-xs bg-black/30 px-2 py-1 rounded backdrop-blur-sm whitespace-nowrap">
                        {value.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>

                {/* تأثير الإضاءة */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/20 pointer-events-none"></div>

                {/* خط المؤشر */}
                <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
              </div>

              {/* التسمية */}
              <div className="mt-3 text-center w-full">
                <p 
                  className="text-xs font-bold text-gray-700 group-hover:text-green-600 transition-colors truncate w-full px-1"
                  title={labels[i]}>
                  {labels[i]}
                </p>
                {heightPercent <= 15 && (
                  <p className="text-xs text-gray-500 mt-1 font-semibold">
                    {value.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
