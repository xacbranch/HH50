"use client";

export default function BrushHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative inline-block px-4 py-2">
      {/* Orange brush strokes behind text */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 400 120"
        preserveAspectRatio="none"
        style={{ zIndex: 0 }}
      >
        <path
          d="M5 15 Q40 8 100 16 T200 12 T300 18 T395 10 L395 35 Q350 40 300 34 T200 38 T100 32 T5 38 Z"
          fill="#d4732a"
          opacity="0.95"
        />
        <path
          d="M10 45 Q60 38 130 47 T260 43 T380 50 L380 70 Q320 76 250 68 T130 73 T10 66 Z"
          fill="#c46520"
          opacity="0.9"
        />
        <path
          d="M15 78 Q70 72 150 80 T300 76 T390 83 L390 100 Q320 106 240 98 T100 103 T15 96 Z"
          fill="#d4732a"
          opacity="0.85"
        />
      </svg>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
