"use client";

import { useState } from "react";
import { compressImage } from "@/lib/image";

interface StepImageEditableProps {
  src: string;
  stepNumber: number;
  onRemove: () => void;
  onChange: (dataUrl: string) => void;
}

export function StepImageEditable({ src, stepNumber, onRemove, onChange }: StepImageEditableProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <label className="flex h-8 cursor-pointer items-center gap-1 text-xs text-cottage-text-muted active:text-cottage-accent">
        <span>📷 사진 추가</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const compressed = await compressImage(file);
            onChange(compressed);
            setError(false);
          }}
        />
      </label>
    );
  }

  return (
    <div className="relative">
      <img
        src={src}
        alt={`단계 ${stepNumber}`}
        className="h-32 w-full rounded-lg object-cover"
        onError={() => setError(true)}
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-cottage-text/70 text-[0.6rem] text-white"
      >
        ✕
      </button>
    </div>
  );
}
