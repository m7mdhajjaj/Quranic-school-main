// components/DailyActivitiesSection.tsx
import { Card } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";
import { RangeSlider } from "@/components/UI/RangeSlider";

interface DailyActivitiesSectionProps {
  parentRespect: number;
  schoolAttendance: boolean;
  dailyStudy: number;
  onParentRespectChange: (value: number) => void;
  onSchoolAttendanceToggle: () => void;
  onDailyStudyChange: (value: number) => void;
}

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
          <div className="text-4xl">❤️</div>
          <h2 className="text-xl font-bold text-gray-800">بر الوالدين</h2>
        </div>
        <div className="text-center">
          <div className="text-6xl font-black text-pink-600 mb-2">
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
          <div className="text-4xl">🎒</div>
          <h2 className="text-xl font-bold text-gray-800">الذهاب للمدرسة</h2>
        </div>
        <div className="text-center">
          <Button
            onClick={onSchoolAttendanceToggle}
            variant={schoolAttendance ? "success" : "danger"}
            className="w-full">
            <div
              className={`text-7xl mb-3 transition-all ${
                schoolAttendance ? "animate-bounce" : ""
              }`}>
              {schoolAttendance ? "✅" : "❌"}
            </div>
            <p className="text-lg font-bold text-gray-700 mb-3">
              {schoolAttendance ? "حضرت اليوم" : "لم أحضر"}
            </p>
          </Button>
          <div>
            <span
              className={`px-4 py-2 rounded-full text-white font-medium ${
                schoolAttendance ? "bg-green-500" : "bg-red-500"
              }`}>
              {schoolAttendance ? "+5 نقاط" : "0 نقطة"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-3">اضغط للتبديل</p>
        </div>
      </Card>

      {/* الدراسة اليومية */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="text-4xl">📚</div>
          <h2 className="text-xl font-bold text-gray-800">الدراسة اليومية</h2>
        </div>
        <div className="text-center">
          <div className="text-6xl font-black text-blue-600 mb-2">
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
          <div className="text-3xl font-bold text-green-600">
            +{dailyStudy * 2} نقطة
          </div>
          <p className="text-xs text-gray-500 mt-2">كل ساعة = نقطتان</p>
        </div>
      </Card>
    </div>
  );
};
