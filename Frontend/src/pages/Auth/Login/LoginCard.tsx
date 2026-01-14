import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, PageHeader } from "@/components/UI";
import { GlassReflection } from "./GlassReflection";
import { SOUNDS } from "@/utils/soundUrls";

interface LoginCardProps {
  children: React.ReactNode;
  error?: string;
  success?: boolean;
}

export const LoginCard: React.FC<LoginCardProps> = ({ children, error, success }) => {
  const [shake, setShake] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const lastErrorRef = useRef<string | undefined>(undefined);
  const errorAudioRef = useRef<HTMLAudioElement | null>(null);

  // تحميل الصوت مرة واحدة
  useEffect(() => {
    errorAudioRef.current = new Audio(SOUNDS.ERROR);
    errorAudioRef.current.volume = 0.18;
  }, []);

  useEffect(() => {
    // تشغيل صوت الخطأ فقط عند تغير الخطأ وليس عند التحميل الأول
    if (error && error !== lastErrorRef.current && lastErrorRef.current !== undefined) {
      setShake(true);
      errorAudioRef.current?.play().catch(() => {});
      setTimeout(() => setShake(false), 600);
    }
    lastErrorRef.current = error;
  }, [error]);

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1200);
    }
  }, [success]);

  return (
    <div className={`relative w-full${shake ? ' animate-shake' : ''}`}>
      {/* Simple Glow Effect */}
      <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400/30 via-teal-400/30 to-cyan-400/30 rounded-3xl blur-2xl opacity-40" />

      {/* Card Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Success Animation */}
        {showSuccess && (
          <div className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2">
            <svg width="180" height="180" viewBox="0 0 180 180">
              <circle cx="90" cy="90" r="70" fill="#10b98122" />
              <circle cx="90" cy="90" r="60" fill="#10b98133" />
              <circle cx="90" cy="90" r="50" fill="#10b98155" />
              <polyline points="70,95 85,110 110,75" fill="none" stroke="#059669" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        <Card
          variant="elevated"
          padding="md"
          className="relative bg-white/95 backdrop-blur-xl border-emerald-200/50 overflow-hidden py-3"
        >
          {/* Glass Reflection Sweep */}
          <GlassReflection />

          {/* Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-teal-50/30 pointer-events-none" />

          {/* Corner Accents - Static */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/10 to-transparent rounded-bl-full opacity-60" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-teal-400/10 to-transparent rounded-tr-full opacity-50" />

          {/* Title */}
          <PageHeader
            title="تسجيل الدخول"
            subtitle="قم بإدخال معلومات الدخول الخاصة بك"
            showDivider={true}
          />

          {/* Form Content */}
          {children}

          {/* Footer */}
          <div className="text-center mt-2 pt-2 border-t border-emerald-100 relative z-10">
            <p className="text-gray-500 text-[10px]">
              جميع الحقوق محفوظة © {new Date().getFullYear()} | مدرسة القرآن الكريم ✨
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
