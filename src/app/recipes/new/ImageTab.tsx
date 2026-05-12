"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { ParsedRecipe } from "@/types/recipe";

interface ImageTabProps {
  onParsed: (result: ParsedRecipe, type: "url" | "image", url?: string) => void;
}

export function ImageTab({ onParsed }: ImageTabProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(selected);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch("/api/recipes/parse-image", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok || data.error) { setError(data.error ?? data.reason ?? "파싱에 실패했습니다"); setLoading(false); return; }
    setLoading(false);
    onParsed(data, "image");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 pt-16">
        <div className="animate-[bounce_2s_ease-in-out_infinite]">
          <Image src="/images/coco_loading.png" alt="분석 중..." width={120} height={120} className="h-auto" />
        </div>
        <p className="text-sm font-medium text-cottage-text-sub">코코가 사진을 분석하고 있어요...</p>
        <p className="text-xs text-cottage-text-muted">이미지를 읽고 레시피를 추출 중이에요</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <button type="button" onClick={() => inputRef.current?.click()} className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-cottage-border bg-white text-cottage-text-muted transition-colors active:border-primary active:text-primary">
        {preview ? (
          <img src={preview} alt="미리보기" className="h-full w-full rounded-xl object-contain" />
        ) : (
          <>
            <span className="text-3xl">📷</span>
            <span className="text-sm font-medium">탭하여 사진 선택</span>
            <span className="text-xs text-cottage-text-muted">JPG, PNG, WebP (최대 10MB)</span>
          </>
        )}
      </button>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
      {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-100">{error}</div>}
      <Button type="button" onClick={handleSubmit} disabled={!file} className="h-12 rounded-xl text-base font-semibold">레시피 분석하기</Button>
    </div>
  );
}
