import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Info, Image as ImageIcon } from 'lucide-react';

type Props = {
  isOpen: boolean;
  title: string;
  content: string;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const NewsGalleryModal = ({
  isOpen,
  title,
  content,
  images,
  initialIndex = 0,
  onClose,
}: Props) => {
  const safeImages = useMemo(
    () => (Array.isArray(images) ? images.filter((u) => u && u.trim() !== '') : []),
    [images]
  );

  const [activeIndex, setActiveIndex] = useState(() =>
    clamp(initialIndex, 0, Math.max(0, safeImages.length - 1))
  );
  const [showDetails, setShowDetails] = useState(true);
  const [animateIn, setAnimateIn] = useState(false);

  // Reset index when opening / list changes
  useEffect(() => {
    if (!isOpen) return;
    setActiveIndex(clamp(initialIndex, 0, Math.max(0, safeImages.length - 1)));
    setShowDetails(true);
    // trigger enter animation after mount using requestAnimationFrame for better performance
    setAnimateIn(false);
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimateIn(true);
      });
    });
    return () => cancelAnimationFrame(rafId);
  }, [isOpen, initialIndex, safeImages.length]);

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (safeImages.length <= 1) return;
      if (e.key === 'ArrowLeft') setActiveIndex((i) => (i === 0 ? safeImages.length - 1 : i - 1));
      if (e.key === 'ArrowRight') setActiveIndex((i) => (i === safeImages.length - 1 ? 0 : i + 1));
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose, safeImages.length]);

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const hasImages = safeImages.length > 0;
  const hasMultiple = safeImages.length > 1;
  const currentSrc = hasImages ? safeImages[activeIndex] : null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] h-screen w-screen bg-black transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none ${
        animateIn ? 'opacity-100' : 'opacity-0'
      }`}
      role="dialog"
      aria-modal="true"
    >
      {/* Clickable backdrop area */}
      <button
        type="button"
        aria-label="إغلاق"
        onClick={onClose}
        className={`absolute inset-0 bg-gradient-to-b from-black/95 via-black/85 to-black/95 transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none ${
          animateIn ? 'backdrop-blur-sm' : 'backdrop-blur-none'
        }`}
      />

      {/* Foreground layout: full screen */}
      <div
        className={`relative z-10 flex h-full w-full flex-col transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none ${
          animateIn ? 'scale-100 translate-y-0' : 'scale-[0.985] translate-y-1'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 px-3 py-3 sm:px-5" dir="rtl">
          <div className="min-w-0">
            <div className="text-white/95 font-semibold line-clamp-1">{title}</div>
            <div className="mt-0.5 text-xs text-white/60">ESC للإغلاق • الأسهم للتنقل</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDetails((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 transition"
              aria-label={showDetails ? 'إخفاء التفاصيل' : 'إظهار التفاصيل'}
            >
              <Info size={16} />
              {showDetails ? 'إخفاء' : 'تفاصيل'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition"
              aria-label="إغلاق"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Image stage (takes the remaining height) */}
        <div className="relative flex-1">
          {/* subtle vignette */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),rgba(0,0,0,0)_55%)]" />

          <div className="absolute inset-0 flex items-center justify-center px-2 sm:px-10">
            {currentSrc ? (
              <img
                src={currentSrc}
                alt={`صورة ${activeIndex + 1}`}
                className="h-full w-full object-contain select-none drop-shadow-[0_22px_55px_rgba(0,0,0,0.55)] transition-opacity duration-200"
                loading="eager"
                decoding="async"
                draggable={false}
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 text-white/75">
                <div className="rounded-2xl bg-white/10 p-4">
                  <ImageIcon size={34} />
                </div>
                <div className="text-sm">لا توجد صور لهذا الخبر</div>
              </div>
            )}
          </div>

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={() => setActiveIndex((i) => (i === 0 ? safeImages.length - 1 : i - 1))}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3.5 text-white hover:bg-white/20 backdrop-blur-md shadow-lg transition-transform hover:scale-105 active:scale-95"
                aria-label="الصورة السابقة"
              >
                <ChevronLeft size={28} strokeWidth={3} />
              </button>
              <button
                type="button"
                onClick={() => setActiveIndex((i) => (i === safeImages.length - 1 ? 0 : i + 1))}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3.5 text-white hover:bg-white/20 backdrop-blur-md shadow-lg transition-transform hover:scale-105 active:scale-95"
                aria-label="الصورة التالية"
              >
                <ChevronRight size={28} strokeWidth={3} />
              </button>

              <div className="absolute left-3 sm:left-6 top-4 rounded-md bg-black/55 px-2 py-1 text-xs font-semibold text-white backdrop-blur-md">
                {activeIndex + 1} / {safeImages.length}
              </div>
            </>
          )}
        </div>

        {/* Bottom strip */}
        <div
          className={`border-t border-white/10 bg-black/45 backdrop-blur-md transition-all duration-200 ${
            showDetails ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none translate-y-2 h-0'
          }`}
        >
          {hasMultiple && (
            <div className="flex gap-2 overflow-x-auto px-3 py-3 sm:px-5">
              {safeImages.map((src, idx) => (
                <button
                  key={`${src}-${idx}`}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-2xl border transition ${
                    idx === activeIndex
                      ? 'border-emerald-400 ring-2 ring-emerald-400/30'
                      : 'border-white/20 hover:border-white/35'
                  }`}
                  aria-label={`عرض الصورة ${idx + 1}`}
                >
                  <img src={src} alt={`مصغرة ${idx + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="max-h-44 overflow-auto px-3 pb-4 text-sm text-white/85 sm:px-5" dir="rtl">
            <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
          </div>
        </div>
      </div>
    </div>
  , document.body);
};

export default NewsGalleryModal;

