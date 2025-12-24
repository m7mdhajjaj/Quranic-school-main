import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  width?: string;
  variant?: 'light' | 'dark';
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  className = '',
  width = 'w-56',
  variant = 'dark',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    updatePosition();
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 100);
  };

  useEffect(() => {
    if (isVisible) {
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isVisible]);

  const bgColors = {
    light: 'bg-white border-2 border-emerald-300 text-gray-800',
    dark: 'bg-gray-800 text-white border border-gray-700',
  };

  const arrowColors = {
    light: {
      top: 'border-t-white',
      bottom: 'border-b-white',
      left: 'border-l-white',
      right: 'border-r-white',
    },
    dark: {
      top: 'border-t-gray-800',
      bottom: 'border-b-gray-800',
      left: 'border-l-gray-800',
      right: 'border-r-gray-800',
    },
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-px',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-px',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-px',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-px',
  };

  const getTooltipStyles = (): React.CSSProperties => {
    const gap = 8;
    const { top, left, width: triggerWidth, height: triggerHeight } = coords;

    switch (position) {
      case 'top':
        return {
          top: top - gap,
          left: left + triggerWidth / 2,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          top: top + triggerHeight + gap,
          left: left + triggerWidth / 2,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        return {
          top: top + triggerHeight / 2,
          left: left - gap,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          top: top + triggerHeight / 2,
          left: left + triggerWidth + gap,
          transform: 'translate(0, -50%)',
        };
      default:
        return {};
    }
  };

  return (
    <>
      <div 
        ref={triggerRef}
        className={`relative ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>

      {isVisible && createPortal(
        <div 
          className={`fixed z-[9999] ${width}`}
          style={getTooltipStyles()}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className={`${bgColors[variant]} rounded-lg shadow-xl p-2 text-xs backdrop-blur-sm relative`} dir="rtl">
            <div className={`absolute ${arrowClasses[position]}`}>
              <div className={`border-4 border-transparent ${arrowColors[variant][position]}`}></div>
            </div>
            {content}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
