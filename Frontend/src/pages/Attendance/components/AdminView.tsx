// AdminView.tsx - صفحة مراقبة الحضور للأدمن
import { Calendar, Users, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { Card } from "@/components/UI/Card";

interface AdminViewProps {
  // يمكن إضافة props لاحقاً
}

export const AdminView = ({}: AdminViewProps) => {
  // بيانات تجريبية للمنظر (يمكن ربطها بـ API لاحقاً)
  const stats = {
    totalStudents: 245,
    presentToday: 230,
    absentToday: 15,
    attendanceRate: 93.9
  };

  const recentAbsences = [
    { id: 1, name: "أحمد محمد علي", group: "حلقة الفجر", teacher: "محمد أحمد", date: "18/12/2024" },
    { id: 2, name: "فاطمة خالد", group: "حلقة النور", teacher: "علي حسن", date: "18/12/2024" },
    { id: 3, name: "عمر يوسف", group: "حلقة الهدى", teacher: "خالد سعيد", date: "18/12/2024" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 rounded-3xl shadow-2xl p-8">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">لوحة مراقبة الحضور</h2>
              <p className="text-purple-50 text-sm mt-1">إحصائيات شاملة لحضور جميع الطلاب</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* إجمالي الطلاب */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:shadow-xl transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 backdrop-blur-sm rounded-2xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="px-3 py-1 bg-blue-100 rounded-full border border-blue-200">
                <span className="text-xs font-bold text-blue-700">الكل</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-blue-700">إجمالي الطلاب</p>
              <p className="text-4xl font-black bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {stats.totalStudents}
              </p>
            </div>
          </div>
        </Card>

        {/* الحاضرون */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200 hover:shadow-xl transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-500/10 backdrop-blur-sm rounded-2xl">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="px-3 py-1 bg-emerald-100 rounded-full border border-emerald-200">
                <span className="text-xs font-bold text-emerald-700">اليوم</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-emerald-700">الحاضرون اليوم</p>
              <p className="text-4xl font-black bg-gradient-to-br from-emerald-600 to-green-600 bg-clip-text text-transparent">
                {stats.presentToday}
              </p>
            </div>
          </div>
        </Card>

        {/* الغائبون */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-rose-100 border-red-200 hover:shadow-xl transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-500/10 backdrop-blur-sm rounded-2xl">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="px-3 py-1 bg-red-100 rounded-full border border-red-200">
                <span className="text-xs font-bold text-red-700">اليوم</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-red-700">الغائبون اليوم</p>
              <p className="text-4xl font-black bg-gradient-to-br from-red-600 to-rose-600 bg-clip-text text-transparent">
                {stats.absentToday}
              </p>
            </div>
          </div>
        </Card>

        {/* نسبة الحضور */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200 hover:shadow-xl transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-500/10 backdrop-blur-sm rounded-2xl">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <div className="px-3 py-1 bg-amber-100 rounded-full border border-amber-200">
                <span className="text-xs font-bold text-amber-700">النسبة</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-amber-700">نسبة الحضور</p>
              <div className="flex items-baseline gap-1">
                <p className="text-4xl font-black bg-gradient-to-br from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {stats.attendanceRate}
                </p>
                <p className="text-2xl font-black bg-gradient-to-br from-amber-500 to-orange-500 bg-clip-text text-transparent">%</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* الطلاب الغائبون اليوم */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 py-6 px-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-white/10 backdrop-blur-sm rounded-xl">
              <XCircle className="w-6 h-6" />
            </div>
            الطلاب الغائبون اليوم
          </h2>
          <p className="text-purple-50 text-sm mt-2">قائمة بالطلاب المتغيبين عن الحضور اليوم</p>
        </div>

        <div className="p-6 md:p-8">
          {recentAbsences.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">لا يوجد غيابات!</h3>
              <p className="text-gray-500">جميع الطلاب حاضرون اليوم 🎉</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">#</th>
                    <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">اسم الطالب</th>
                    <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">الحلقة</th>
                    <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">المعلم</th>
                    <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentAbsences.map((absence, index) => (
                    <tr key={absence.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 text-sm text-gray-600">{index + 1}</td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-gray-900">{absence.name}</span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{absence.group}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{absence.teacher}</td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          {absence.date}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ملاحظة */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm text-purple-900 font-bold mb-2">للإدارة فقط</p>
            <p className="text-sm text-purple-800 leading-relaxed">
              هذه الصفحة للمراقبة والإحصائيات العامة. 
              لتسجيل الحضور، يرجى استخدام حساب المعلم.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
