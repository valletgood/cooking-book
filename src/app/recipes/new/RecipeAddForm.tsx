"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UrlTab } from "./UrlTab";
import { ImageTab } from "./ImageTab";
import { ParsedRecipePreview } from "./ParsedRecipePreview";
import { RecipeEditForm, type EditableRecipe } from "@/components/recipe/RecipeEditForm";
import { ImageUpload } from "@/components/recipe/ImageUpload";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { ParsedRecipe } from "@/types/recipe";

type Tab = "url" | "image" | "manual";

const EMPTY_RECIPE: EditableRecipe = {
  title: "",
  description: "",
  category: "other",
  servings: 1,
  prep_time: "",
  cook_time: "",
  ingredients: [{ name: "", amount: "", unit: "" }],
  steps: [{ step_number: 1, instruction: "", tip: "" }],
  nutrition: null,
};

export function RecipeAddForm() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("url");
  const [parsed, setParsed] = useState<ParsedRecipe | null>(null);
  const [sourceType, setSourceType] = useState<"url" | "image">("url");
  const [sourceUrl, setSourceUrl] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // 수동 입력 상태
  const [manualRecipe, setManualRecipe] = useState<EditableRecipe>({ ...EMPTY_RECIPE });
  const [manualImages, setManualImages] = useState<string[]>([]);

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
      body: JSON.stringify({
        ...parsed,
        source_type: sourceType,
        source_url: sourceUrl || undefined,
        image_url: images[0] || undefined,
        images: images.length > 0 ? JSON.stringify(images) : undefined,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/recipes/${data.id}`);
    } else {
      toast.error("저장에 실패했습니다. 다시 시도해주세요.");
      setSaving(false);
    }
  };

  const handleManualSave = async () => {
    if (!manualRecipe.title.trim()) {
      toast.error("레시피 제목을 입력해주세요");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...manualRecipe,
        source_type: "url",
        image_url: manualImages[0] || undefined,
        images: manualImages.length > 0 ? JSON.stringify(manualImages) : undefined,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/recipes/${data.id}`);
    } else {
      toast.error("저장에 실패했습니다. 다시 시도해주세요.");
      setSaving(false);
    }
  };

  const handleReset = () => {
    setParsed(null);
    setSourceUrl("");
    setImages([]);
  };

  if (parsed) {
    return (
      <ParsedRecipePreview
        recipe={parsed}
        onUpdate={setParsed}
        onSave={handleSave}
        onReset={handleReset}
        saving={saving}
        images={images}
        onImagesChange={setImages}
      />
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-cottage-bg">
      <header className="sticky top-0 z-10 bg-cottage-bg/95 px-4 pb-3 pt-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-lg text-cottage-text-sub active:text-cottage-text">←</button>
          <h1 className="font-heading text-xl font-extrabold text-cottage-text">레시피 추가</h1>
        </div>
        <div className="mt-3 flex rounded-xl bg-white p-1 ring-1 ring-cottage-border">
          {(["url", "image", "manual"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                tab === t
                  ? "bg-primary text-white shadow-sm"
                  : "text-cottage-text-sub active:text-cottage-text"
              }`}
            >
              {t === "url" ? "URL" : t === "image" ? "사진" : "직접 입력"}
            </button>
          ))}
        </div>
      </header>
      <main className="flex-1 px-4 pt-4">
        {tab === "url" && <UrlTab onParsed={handleParsed} />}
        {tab === "image" && <ImageTab onParsed={handleParsed} />}
        {tab === "manual" && (
          <div className="space-y-3 pb-28">
            <ImageUpload images={manualImages} onImagesChange={setManualImages} />
            <RecipeEditForm recipe={manualRecipe} onUpdate={setManualRecipe} />
            <div className="fixed inset-x-0 bottom-0 bg-cottage-bg/95 px-4 pb-6 pt-3 backdrop-blur-sm">
              <Button
                onClick={handleManualSave}
                disabled={saving}
                className="h-12 w-full rounded-xl bg-cottage-text text-base font-semibold text-cottage-bg hover:bg-cottage-text/90"
              >
                {saving ? <><Spinner size="sm" /> 저장 중...</> : "저장하기"}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
