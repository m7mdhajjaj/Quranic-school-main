import React from "react";

const Terms = () => (
  <div
    className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8 mb-8"
    dir="rtl">
    <h1 className="text-2xl font-bold mb-4 text-emerald-700">
      الشروط والأحكام
    </h1>
    <ul className="list-disc pr-6 text-gray-700 mb-4">
      <li>استخدام الموقع متاح لجميع الطلاب والمعلمين بعد التسجيل.</li>
      <li>يجب احترام جميع المستخدمين وعدم الإساءة أو نشر محتوى غير لائق.</li>
      <li>يحق لإدارة الموقع تعديل أو حذف أي محتوى مخالف.</li>
      <li>يمنع استخدام الموقع لأي أغراض تجارية أو دعائية بدون إذن مسبق.</li>
      <li>
        قد يتم تحديث الشروط والأحكام من وقت لآخر، ويجب على المستخدمين مراجعتها
        باستمرار.
      </li>
    </ul>
    <p className="text-gray-600">
      باستخدامك للموقع، فإنك توافق على جميع الشروط والأحكام المذكورة أعلاه.
    </p>
  </div>
);

export default Terms;
