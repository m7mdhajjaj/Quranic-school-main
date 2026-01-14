// GlassReflection.tsx
import React from "react";

export const GlassReflection: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div
    className={
      "pointer-events-none absolute left-0 top-0 w-full h-full z-20 overflow-hidden " + className
    }
    aria-hidden="true"
  >
    <svg
      className="w-full h-full"
      viewBox="0 0 400 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ pointerEvents: "none" }}
    >
      <defs>
        <linearGradient id="reflection-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.25" />
          <stop offset="60%" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect
        x="-40"
        y="-40"
        width="480"
        height="80"
        rx="40"
        fill="url(#reflection-gradient)"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          from="-400 0"
          to="400 0"
          dur="3.5s"
          repeatCount="indefinite"
        />
      </rect>
    </svg>
  </div>
);
