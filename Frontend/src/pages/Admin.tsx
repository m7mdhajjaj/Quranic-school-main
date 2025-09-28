import React from "react";

const Admin: React.FC = () => {
  return (
    <div className="admin-page">
      {/* Content Area */}
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              الإحصائيات
            </h2>
            <p className="text-gray-600">
              هنا ستظهر الإحصائيات والتقارير المختلفة للمدرسة.
            </p>
            {/* يمكن إضافة المحتوى الفعلي للإحصائيات هنا */}
          </div>

          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">الإدارة</h2>
            <p className="text-gray-600">
              هنا ستظهر أدوات الإدارة والتحكم في النظام.
            </p>
            {/* يمكن إضافة المحتوى الفعلي للإدارة هنا */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
