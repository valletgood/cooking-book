"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UrlTab } from "./UrlTab";
import { ImageTab } from "./ImageTab";
import { ParsedRecipePreview } from "./ParsedRecipePreview";
import type { ParsedRecipe } from "@/types/recipe";

type Tab = "url" | "image";

export function RecipeAddForm() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("url");
  const [parsed, setParsed] = useState<ParsedRecipe | null>(null);
  const [sourceType, setSourceType] = useState<"url" | "image">("url");
  const [sourceUrl, setSourceUrl] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const handleParsed = (result: ParsedRecipe, type: "url" | "image", url?: string) => {
    setParsed(result);
    setSourceType(type);
    setSourceUrl(url ?? "");
  };

  const handleSave = async () => {
    if (!parsed) return;
    setSaving(true);
    const res = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...parsed, source_type: sourceType, source_url: sourceUrl || undefined }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/recipes/${data.id}`);
    } else {
      alert("저장에 실패했습니다. 다시 시도해주세요.");
      setSaving(false);
    }
  };

  const handleReset = () => {
    setParsed(null);
    setSourceUrl("");
  };

  if (parsed) {
    return <ParsedRecipePreview recipe={parsed} onUpdate={setParsed} onSave={handleSave} onReset={handleReset} saving={saving} />;
  }

  return (
    <div className="flex min-h-full flex-col bg-cottage-bg">
      <header className="sticky top-0 z-10 bg-cottage-bg/95 px-4 pb-3 pt-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-lg text-cottage-text-sub active:text-cottage-text">←</button>
          <h1 className="font-heading text-xl font-extrabold text-cottage-text">레시피 추가</h1>
        </div>
        <div className="mt-3 flex rounded-xl bg-white p-1 ring-1 ring-cottage-border">
          <button
            onClick={() => setTab("url")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${tab === "url" ? "bg-primary text-white shadow-sm" : "text-cottage-text-sub active:text-cottage-text"}`}
          >
            URL 입력
          </button>
          <button
            onClick={() => setTab("image")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${tab === "image" ? "bg-primary text-white shadow-sm" : "text-cottage-text-sub active:text-cottage-text"}`}
          >
            이미지 업로드
          </button>
        </div>
      </header>
      <main className="flex-1 px-4 pt-4">
        {tab === "url" ? <UrlTab onParsed={handleParsed} /> : <ImageTab onParsed={handleParsed} />}
      </main>
    </div>
  );
}
