import React, { useEffect, useRef } from "react";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "scale";
  className?: string;
  once?: boolean;
}

/**
 * Reveal - مكون لإظهار العناصر بتأثيرات انيميشن عند الظهور
 * 
 * @param children - المحتوى المراد إظهاره
 * @param delay - التأخير قبل بدء الانيميشن (بالثواني)
 * @param duration - مدة الانيميشن (بالثواني)
 * @param direction - اتجاه الانيميشن
 * @param className - classes إضافية
 * @param once - تشغيل الانيميشن مرة واحدة فقط (افتراضي: true)
 */
const Reveal: React.FC<RevealProps> = ({
  children,
  delay = 0,
  duration = 0.6,
  direction = "up",
  className = "",
  once = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) {
              observer.unobserve(element);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [once]);

  const getTransform = () => {
    switch (direction) {
      case "up":
        return "translateY(40px)";
      case "down":
        return "translateY(-40px)";
      case "left":
        return "translateX(40px)";
      case "right":
        return "translateX(-40px)";
      case "scale":
        return "scale(0.8)";
      default:
        return "translateY(40px)";
    }
  };

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${className}`}
      style={
        {
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0) translateX(0) scale(1)" : getTransform(),
          transitionDuration: `${duration}s`,
          transitionDelay: `${delay}s`,
        } as React.CSSProperties
      }>
      {children}
    </div>
  );
};

export default Reveal;
