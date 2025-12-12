import React from "react";
import type { BarChartProps } from "../types";

export const BarChart: React.FC<BarChartProps> = ({
  data,
  labels,
  colors = ["bg-gradient-to-t from-blue-500 to-blue-600"],
  maxValue = 100,
}) => {
  const max = Math.max(...data, maxValue);
  const total = data.reduce((sum, val) => sum + val, 0);

  const defaultColors = [
    "bg-gradient-to-t from-green-500 to-green-600",
    "bg-gradient-to-t from-emerald-500 to-emerald-600",
    "bg-gradient-to-t from-teal-500 to-teal-600",
    "bg-gradient-to-t from-lime-500 to-lime-600",
    "bg-gradient-to-t from-green-600 to-emerald-600",
  ];

  return (
    <div className="h-full flex items-end justify-around gap-3 px-2">
      {data.map((value, i) => {
        const heightPercent = (value / max) * 100;
        const percentage = total > 0 ? (value / total) * 100 : 0;
        const color = colors[i] || defaultColors[i % defaultColors.length];

        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center group relative">
            {/* النسبة المئوية عند hover */}
            <div className="mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-1">
              <span className="text-xs font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 px-3 py-1.5 rounded-lg shadow-lg border border-white/20">
                {percentage.toFixed(1)}%
              </span>
            </div>

            <div className="w-full bg-gray-100 rounded-2xl relative h-52 overflow-hidden shadow-inner">
              <div
                className={`${color} rounded-2xl absolute bottom-0 w-full transition-all duration-1000 hover:opacity-90 flex items-center justify-center group-hover:shadow-xl transform group-hover:scale-[1.02]`}
                style={{
                  height: `${Math.max(heightPercent, 8)}%`,
                  animationDelay: `${i * 200}ms`,
                }}>
                {/* القيمة */}
                <div className="text-center text-white">
                  <div className="font-bold text-sm bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
                    {value.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* تأثير الإضاءة */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/20 pointer-events-none"></div>

              {/* خط المؤشر */}
              <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
            </div>

            {/* التسمية */}
            <div className="mt-3 text-center">
              <p className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                {labels[i]}
              </p>
              <p className="text-xs text-gray-500 mt-1 font-semibold">
                {value.toLocaleString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
