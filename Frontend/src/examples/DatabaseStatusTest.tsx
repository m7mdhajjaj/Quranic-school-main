import React from 'react';
import Avatar from '../components/Avatar';

const DatabaseStatusTest: React.FC = () => {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          🧪 اختبار نظام الحالة الجديد
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            📊 حالة المستخدم من قاعدة البيانات
          </h2>
          <p className="text-gray-600 mb-6">
            النقاط الآن تأخذ القيمة من حقل <code className="bg-gray-100 px-2 py-1 rounded">isActive</code> في قاعدة البيانات
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* حالة من قاعدة البيانات */}
            <div className="text-center p-4 border rounded-lg">
              <Avatar 
                userName="أحمد محمد"
                size="xl"
                showStatus={true}
                gender="male"
              />
              <h3 className="mt-2 font-medium">أحمد محمد</h3>
              <p className="text-sm text-gray-500">حالة من قاعدة البيانات</p>
            </div>
            
            {/* إجبار حالة خضراء */}
            <div className="text-center p-4 border rounded-lg">
              <Avatar 
                userName="سارة أحمد"
                size="xl"
                showStatus={true}
                forceStatus="online"
                gender="female"
              />
              <h3 className="mt-2 font-medium">سارة أحمد</h3>
              <p className="text-sm text-gray-500">إجبار حالة متصل</p>
            </div>
            
            {/* إجبار حالة حمراء */}
            <div className="text-center p-4 border rounded-lg">
              <Avatar 
                userName="محمد علي"
                size="xl"
                showStatus={true}
                forceStatus="offline"
                gender="male"
              />
              <h3 className="mt-2 font-medium">محمد علي</h3>
              <p className="text-sm text-gray-500">إجبار حالة غير متصل</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            🔧 أحجام مختلفة مع النقاط
          </h2>
          
          <div className="flex flex-wrap items-center gap-4">
            {(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const).map(size => (
              <div key={size} className="text-center">
                <Avatar 
                  userName="ت"
                  size={size}
                  showStatus={true}
                  gender="male"
                />
                <p className="text-xs mt-1 text-gray-500">{size}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            🧪 اختبار API يدوياً
          </h2>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">افتح Console في المتصفح وجرب:</p>
            <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
{`// جلب حالة المستخدم الحالي
fetch('/api/users/' + JSON.parse(localStorage.getItem('user'))._id + '/status', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
})
.then(res => res.json())
.then(console.log);

// جلب قائمة النشطين  
fetch('/api/users/online', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
})
.then(res => res.json())
.then(console.log);`}
            </pre>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">💡 معلومات مهمة:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• النقطة **الخضراء** = المستخدم نشط في قاعدة البيانات</li>
              <li>• النقطة **الحمراء** = المستخدم غير نشط في قاعدة البيانات</li>
              <li>• **Tooltip** يظهر مصدر الحالة (قاعدة البيانات/احتياطي/إجبار)</li>
              <li>• النظام يحدث كل 30 ثانية تلقائياً</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseStatusTest;