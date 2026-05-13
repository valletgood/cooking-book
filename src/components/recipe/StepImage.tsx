"use client";

import { useState } from "react";

interface StepImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

export function StepImage({ src, alt, className, onClick }: StepImageProps) {
  const [error, setError] = useState(false);

  if (error) return null;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      onClick={onClick}
    />
  );
}
