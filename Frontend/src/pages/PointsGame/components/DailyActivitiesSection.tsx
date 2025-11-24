// components/DailyActivitiesSection.tsx
import { Card } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";
import { RangeSlider } from "@/components/UI/RangeSlider";
import { Heart, Backpack, BookOpen, Check, X } from "lucide-react";
import type { DailyActivitiesSectionProps } from "../types/pointsGame.types";

export const DailyActivitiesSection = ({
  parentRespect,
  schoolAttendance,
  dailyStudy,
  onParentRespectChange,
  onSchoolAttendanceToggle,
  onDailyStudyChange,
}: DailyActivitiesSectionProps) => {
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-6">
      {/* بر الوالدين */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Heart className="w-10 h-10 text-rose-500" />
          <h2 className="text-xl font-bold text-gray-800">بر الوالدين</h2>
        </div>
        <div className="text-center">
          <div className="text-6xl font-black text-emerald-600 mb-2">
            {parentRespect}
          </div>
          <p className="text-gray-600 mb-4">من 10 نقاط</p>
          <RangeSlider
            min={0}
            max={10}
            value={parentRespect}
            onChange={onParentRespectChange}
            className="mb-4"
          />
        </div>
      </Card>

      {/* الذهاب للمدرسة */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Backpack className="w-10 h-10 text-emerald-600" />
          <h2 className="text-xl font-bold text-gray-800">الذهاب للمدرسة</h2>
        </div>
        <div className="text-center space-y-4">
          <button
            onClick={onSchoolAttendanceToggle}
            className={`w-full py-6 rounded-xl transition-all shadow-lg ${
              schoolAttendance
                ? "bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                : "bg-gradient-to-br from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500"
            }`}>
            <div
              className={`mb-2 transition-all flex justify-center ${
                schoolAttendance ? "animate-bounce" : ""
              }`}>
              {schoolAttendance ? <Check className="w-16 h-16" /> : <X className="w-16 h-16" />}
            </div>
            <p className="text-lg font-bold text-white">
              {schoolAttendance ? "حضرت اليوم" : "لم أحضر"}
            </p>
          </button>
          <div
            className={`px-6 py-3 rounded-xl text-white font-bold text-lg ${
              schoolAttendance ? "bg-emerald-500" : "bg-orange-400"
            }`}>
            {schoolAttendance ? "+5 نقاط" : "0 نقطة"}
          </div>
          <p className="text-xs text-gray-500">اضغط للتبديل</p>
        </div>
      </Card>

      {/* الدراسة اليومية */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-10 h-10 text-teal-600" />
          <h2 className="text-xl font-bold text-gray-800">الدراسة اليومية</h2>
        </div>
        <div className="text-center">
          <div className="text-6xl font-black text-teal-600 mb-2">
            {dailyStudy}
          </div>
          <p className="text-gray-600 mb-4">ساعات دراسة</p>
          <div className="flex justify-center gap-2 mb-4">
            <Button
              onClick={() => onDailyStudyChange(Math.max(0, dailyStudy - 0.5))}
              variant="danger"
              className="px-4 py-2 rounded-lg font-bold">
              -
            </Button>
            <Button
              onClick={() => onDailyStudyChange(dailyStudy + 0.5)}
              variant="success"
              className="px-4 py-2 rounded-lg font-bold">
              +
            </Button>
          </div>
          <div className="text-3xl font-bold text-emerald-600">
            +{dailyStudy * 2} نقطة
          </div>
          <p className="text-xs text-gray-500 mt-2">كل ساعة = نقطتان</p>
        </div>
      </Card>
    </div>
  );
};
