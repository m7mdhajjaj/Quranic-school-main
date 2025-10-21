// ============================================================================
// PrayerTimes.tsx - Prayer Times Display Page
// ============================================================================
// This page displays Islamic prayer times
// ============================================================================

import React from 'react';

const PrayerTimes: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8" dir="rtl">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-emerald-700 mb-2">
            مواقيت الصلاة
          </h1>
          <p className="text-gray-600">
            تعرف على مواقيت الصلاة اليومية
          </p>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">🕌</div>
          <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
            قريباً
          </h2>
          <p className="text-gray-600">
            جاري العمل على هذه الميزة
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrayerTimes;
