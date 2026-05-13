"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { ParsedRecipe } from "@/types/recipe";

interface ImageTabProps {
  onParsed: (result: ParsedRecipe, type: "url" | "image", url?: string) => void;
}

export function ImageTab({ onParsed }: ImageTabProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;

    const remaining = 5 - files.length;
    const toAdd = selected.slice(0, remaining);

    setFiles((prev) => [...prev, ...toAdd]);
    setError(null);

    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) =>
        setPreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });

    if (inputRef.current) inputRef.current.value = "";
  };

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!files.length) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    files.forEach((file) => formData.append("image", file));

    const res = await fetch("/api/recipes/parse-image", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (!res.ok || data.error) {
      setError(data.reason ?? "이미지에서 레시피를 분석할 수 없어요. 더 선명한 사진을 시도해주세요.");
      setLoading(false);
      return;
    }

    setLoading(false);
    onParsed(data, "image");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 pt-16">
        <div className="animate-[bounce_2s_ease-in-out_infinite]">
          <Image
            src="/images/coco_loading.png"
            alt="분석 중..."
            width={120}
            height={120}
            className="h-auto"
          />
        </div>
        <p className="text-sm font-medium text-cottage-text-sub">
          코코가 {files.length > 1 ? `${files.length}장의 사진을` : "사진을"}{" "}
          분석하고 있어요...
        </p>
        <p className="text-xs text-cottage-text-muted">
          {files.length > 1
            ? "모든 이미지를 종합하여 레시피를 추출 중이에요"
            : "이미지를 읽고 레시피를 추출 중이에요"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 미리보기 + 추가 버튼 */}
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {previews.map((src, i) => (
          <div key={i} className="relative h-28 w-28 shrink-0">
            <img
              src={src}
              alt={`사진 ${i + 1}`}
              className="h-full w-full rounded-xl object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(i)}
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-cottage-text/70 text-[0.6rem] text-white"
            >
              ✕
            </button>
          </div>
        ))}

        {files.length < 5 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-28 w-28 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-cottage-border bg-white text-cottage-text-muted transition-colors active:border-primary active:text-primary"
          >
            <span className="text-2xl">📷</span>
            <span className="text-[0.65rem] font-medium">
              {files.length === 0 ? "사진 선택" : `${files.length}/5`}
            </span>
          </button>
        )}
      </div>

      {files.length > 1 && (
        <p className="text-xs text-cottage-accent">
          📌 {files.length}장의 이미지를 종합하여 하나의 레시피로 분석합니다
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-100">
          {error}
        </div>
      )}

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={!files.length}
        className="h-12 rounded-xl text-base font-semibold"
      >
        {files.length > 1
          ? `${files.length}장 이미지 분석하기`
          : "레시피 분석하기"}
      </Button>
    </div>
  );
}
