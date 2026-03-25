"use client";

import HennessyLogo from "./HennessyLogo";

interface DarkHeroProps {
  heading: string;
  subheading?: string;
  description?: string;
}

export default function DarkHero({ heading, subheading, description }: DarkHeroProps) {
  return (
    <div className="relative bg-[#1a1a1a] text-white overflow-hidden pb-10 flex-shrink-0">
      {/* Hamburger */}
      <div className="absolute top-5 left-5 z-20">
        <div className="hamburger">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {/* Constrained inner content */}
      <div className="max-w-3xl mx-auto px-6 md:px-12">
        {/* Hennessy logo */}
        <div className="pt-5 pb-2 flex justify-center">
          <HennessyLogo className="w-36 h-auto" />
        </div>

        {/* Heading */}
        <div className="flex justify-center py-4 md:py-6">
          <h1
            className="text-white text-4xl md:text-5xl lg:text-6xl font-bold tracking-wide leading-tight text-center uppercase"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {heading.split("\n").map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </h1>
        </div>

        {/* Subheading & Description */}
        <div className="text-center pb-6 space-y-3">
          {subheading && (
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-wider">{subheading}</h2>
          )}
          {description && (
            <p
              className="text-sm md:text-base leading-relaxed max-w-lg mx-auto opacity-90"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Wave bottom — full width */}
      <svg
        viewBox="0 0 1440 120"
        className="absolute bottom-0 left-0 w-full"
        preserveAspectRatio="none"
        style={{ height: "60px" }}
      >
        <path
          d="M0,40 C360,120 1080,-20 1440,60 L1440,120 L0,120 Z"
          fill="white"
        />
      </svg>
    </div>
  );
}
