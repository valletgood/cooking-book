"use client";

import { useRef } from "react";
import { compressImage } from "@/lib/image";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  max?: number;
}

export function ImageUpload({ images, onImagesChange, max = 5 }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = max - images.length;
    const toProcess = files.slice(0, remaining);

    const compressed = await Promise.all(toProcess.map(compressImage));
    onImagesChange([...images, ...compressed]);

    if (inputRef.current) inputRef.current.value = "";
  };

  const handleRemove = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {images.map((url, i) => (
          <div key={i} className="relative h-24 w-24 shrink-0">
            <img
              src={url}
              alt={`사진 ${i + 1}`}
              className="h-full w-full rounded-xl object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(i)}
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-cottage-text/70 text-[0.6rem] text-white active:bg-cottage-text"
            >
              ✕
            </button>
          </div>
        ))}

        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-cottage-border bg-white text-cottage-text-muted transition-colors active:border-primary active:text-primary"
          >
            <span className="text-lg">📸</span>
            <span className="text-[0.65rem] font-medium">
              {images.length === 0 ? "사진 추가" : `${images.length}/${max}`}
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
