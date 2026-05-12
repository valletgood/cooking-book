"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ParsedRecipe } from "@/types/recipe";

interface UrlTabProps {
  onParsed: (result: ParsedRecipe, type: "url" | "image", url?: string) => void;
}

export function UrlTab({ onParsed }: UrlTabProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/recipes/parse-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: trimmed }) });
    const data = await res.json();
    if (!res.ok || data.error) { setError(data.error ?? data.reason ?? "파싱에 실패했습니다"); setLoading(false); return; }
    setLoading(false);
    onParsed(data, "url", trimmed);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 pt-16">
        <div className="animate-[bounce_2s_ease-in-out_infinite]">
          <Image src="/images/coco_loading.png" alt="분석 중..." width={120} height={120} className="h-auto" />
        </div>
        <p className="text-sm font-medium text-cottage-text-sub">코코가 레시피를 분석하고 있어요...</p>
        <p className="text-xs text-cottage-text-muted">웹페이지를 읽고 레시피를 추출 중이에요</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-cottage-text">레시피 URL</label>
        <Input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.10000recipe.com/recipe/..." className="h-12 rounded-xl border-cottage-border bg-white text-base placeholder:text-cottage-text-muted focus-visible:ring-primary/30" />
      </div>
      {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-100">{error}</div>}
      <Button type="submit" disabled={!url.trim()} className="h-12 rounded-xl text-base font-semibold">레시피 분석하기</Button>
    </form>
  );
}
