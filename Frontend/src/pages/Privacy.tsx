import React from "react";

const Privacy = () => (
  <div
    className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8 mb-8"
    dir="rtl">
    <h1 className="text-2xl font-bold mb-4 text-emerald-700">سياسة الخصوصية</h1>
    <p className="mb-3 text-gray-700">
      نحن في مدرسة القرآن الكريم نلتزم بحماية خصوصية جميع المستخدمين. لا نقوم
      بمشاركة بياناتك الشخصية مع أي جهة خارجية إلا للضرورة القانونية أو لتحسين
      الخدمة.
    </p>
    <ul className="list-disc pr-6 text-gray-700 mb-4">
      <li>يتم جمع بيانات المستخدمين فقط لتحسين تجربة الموقع.</li>
      <li>لا يتم بيع أو مشاركة بياناتك مع أي طرف ثالث.</li>
      <li>يحق لك طلب حذف بياناتك في أي وقت.</li>
      <li>نستخدم تقنيات حديثة لحماية بياناتك من أي اختراق.</li>
    </ul>
    <p className="text-gray-600">
      إذا كان لديك أي استفسار حول سياسة الخصوصية، يرجى التواصل معنا عبر صفحة
      اتصل بنا.
    </p>
  </div>
);

export default Privacy;
