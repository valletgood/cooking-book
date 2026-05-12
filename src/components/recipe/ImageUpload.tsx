"use client";

import { useRef } from "react";
import { compressImage } from "@/lib/image";

interface ImageUploadProps {
  imageUrl: string | null;
  onImageChange: (dataUrl: string | null) => void;
}

export function ImageUpload({ imageUrl, onImageChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const compressed = await compressImage(file);
    onImageChange(compressed);
  };

  const handleRemove = () => {
    onImageChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      {imageUrl ? (
        <div className="relative">
          <img
            src={imageUrl}
            alt="레시피 사진"
            className="h-40 w-full rounded-xl object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-cottage-text/60 text-xs text-white active:bg-cottage-text/80"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-32 w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-cottage-border bg-white text-cottage-text-muted transition-colors active:border-primary active:text-primary"
        >
          <span className="text-2xl">📸</span>
          <span className="text-sm font-medium">요리 사진 추가</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
