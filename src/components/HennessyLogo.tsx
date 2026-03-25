"use client";

import Image from "next/image";

export default function HennessyLogo({
  className = "",
  variant = "white",
}: {
  className?: string;
  variant?: "white" | "color";
}) {
  const src = variant === "white" ? "/hennessy-logo-white.png" : "/hennessy-logo.png";
  return (
    <Image
      src={src}
      alt="Hennessy"
      width={208}
      height={60}
      className={className}
      priority
      unoptimized
    />
  );
}
