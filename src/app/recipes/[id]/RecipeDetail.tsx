"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS } from "@/lib/constants";
import { RecipeEditForm, type EditableRecipe } from "@/components/recipe/RecipeEditForm";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { ImageUpload } from "@/components/recipe/ImageUpload";

interface RecipeDetailProps {
  recipe: {
    id: number;
    title: string;
    description: string | null;
    category: string | null;
    sourceType: string;
    sourceUrl: string | null;
    imageUrl: string | null;
    servings: number | null;
    prepTime: string | null;
    cookTime: string | null;
  };
  ingredients: { id: number; name: string; amount: string | null; unit: string | null; orderIndex: number }[];
  steps: { id: number; stepNumber: number; instruction: string; tip: string | null }[];
  nutrition: { calories: number | null; carbohydrates: number | null; protein: number | null; fat: number | null; sodium: number | null } | null;
  cookingProgress: { currentStep: number; updatedAt: Date } | null;
  cookCount: number;
  cookLogs: { id: number; memo: string | null; cookedAt: Date }[];
}

function toEditable(
  recipe: RecipeDetailProps["recipe"],
  ingredients: RecipeDetailProps["ingredients"],
  steps: RecipeDetailProps["steps"],
  nutrition: RecipeDetailProps["nutrition"],
): EditableRecipe {
  return {
    title: recipe.title,
    description: recipe.description ?? "",
    category: recipe.category ?? "other",
    servings: recipe.servings ?? 1,
    prep_time: recipe.prepTime ?? "",
    cook_time: recipe.cookTime ?? "",
    ingredients: ingredients.map((ing) => ({ name: ing.name, amount: ing.amount ?? "", unit: ing.unit ?? "" })),
    steps: steps.map((s) => ({ step_number: s.stepNumber, instruction: s.instruction, tip: s.tip ?? "" })),
    nutrition: nutrition ? { calories: nutrition.calories ?? 0, carbohydrates: nutrition.carbohydrates ?? 0, protein: nutrition.protein ?? 0, fat: nutrition.fat ?? 0, sodium: nutrition.sodium ?? 0 } : null,
  };
}

const scaleAmount = (amount: string | null, ratio: number): string => {
  if (!amount || ratio === 1) return amount ?? "";
  const num = parseFloat(amount.replace(/[^\d.\/]/g, ""));
  if (isNaN(num)) return amount ?? "";
  // 분수 처리 (예: "1/2")
  if (amount.includes("/")) {
    const [n, d] = amount.split("/").map(Number);
    if (n && d) {
      const result = (n / d) * ratio;
      return result % 1 === 0 ? String(result) : result.toFixed(1);
    }
  }
  const result = num * ratio;
  return result % 1 === 0 ? String(result) : result.toFixed(1);
};

export function RecipeDetail({ recipe, ingredients, steps, nutrition, cookingProgress, cookCount, cookLogs }: RecipeDetailProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [adjustedServings, setAdjustedServings] = useState(recipe.servings ?? 1);
  const servingsRatio = recipe.servings ? adjustedServings / recipe.servings : 1;
  const [editData, setEditData] = useState<EditableRecipe>(() => toEditable(recipe, ingredients, steps, nutrition));
  const parseImages = (): string[] => {
    if (!recipe.imageUrl) return [];
    try {
      const parsed = JSON.parse(recipe.imageUrl);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return [recipe.imageUrl];
  };
  const [editImages, setEditImages] = useState<string[]>(parseImages);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEdit = () => {
    setEditData(toEditable(recipe, ingredients, steps, nutrition));
    setEditImages(parseImages());
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/recipes/${recipe.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editData,
        image_url: editImages.length > 0 ? editImages[0] : null,
        images: editImages.length > 0 ? JSON.stringify(editImages) : undefined,
      }),
    });
    if (res.ok) { setEditing(false); router.refresh(); toast.success("레시피가 수정되었어요"); }
    else { toast.error("수정에 실패했습니다"); }
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const res = await fetch(`/api/recipes/${recipe.id}`, { method: "DELETE" });
    if (res.ok) { toast.success("레시피가 삭제되었어요"); router.push("/"); }
    else { toast.error("삭제에 실패했습니다"); setDeleting(false); }
  };

  if (editing) {
    return (
      <div className="flex min-h-full flex-col bg-cottage-bg">
        <header className="sticky top-0 z-10 bg-cottage-bg/95 px-4 pb-2 pt-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setEditing(false)} className="text-lg text-cottage-text-sub active:text-cottage-text">←</button>
            <h1 className="font-heading text-xl font-extrabold text-cottage-text">레시피 수정</h1>
          </div>
        </header>
        <main className="flex-1 space-y-3 px-4 pb-28 pt-2">
          <ImageUpload images={editImages} onImagesChange={setEditImages} />
          <RecipeEditForm recipe={editData} onUpdate={setEditData} />
        </main>
        <div className="fixed inset-x-0 bottom-0 bg-cottage-bg/95 px-4 pb-6 pt-3 backdrop-blur-sm">
          <div className="flex gap-3">
            <Button onClick={() => setEditing(false)} variant="outline" className="h-12 flex-1 rounded-xl border-cottage-border text-base font-semibold text-cottage-text-sub">취소</Button>
            <Button onClick={handleSave} disabled={saving} className="h-12 flex-1 rounded-xl bg-cottage-text text-base font-semibold text-cottage-bg hover:bg-cottage-text/90">{saving ? <><Spinner size="sm" /> 저장 중...</> : "저장하기"}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-cottage-bg">
      <header className="sticky top-0 z-10 bg-cottage-bg/95 px-4 pb-2 pt-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => router.push("/")} className="text-lg text-cottage-text-sub active:text-cottage-text">←</button>
            <h1 className="truncate font-heading text-xl font-extrabold text-cottage-text">{recipe.title}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button onClick={handleEdit} className="text-sm font-medium text-cottage-accent active:text-primary">수정</button>
            <button onClick={() => setShowDeleteConfirm(true)} disabled={deleting} className="text-sm text-red-400 active:text-red-600 disabled:opacity-50">삭제</button>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-3 px-4 pb-28 pt-2">
        {recipe.imageUrl && (() => {
          let imgs: string[] = [];
          try { const p = JSON.parse(recipe.imageUrl!); if (Array.isArray(p)) imgs = p; } catch {}
          if (!imgs.length) imgs = [recipe.imageUrl!];
          return imgs.length === 1 ? (
            <div className="overflow-hidden rounded-xl"><img src={imgs[0]} alt={recipe.title} className="h-48 w-full object-cover" /></div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {imgs.map((url, i) => (
                <div key={i} className="h-36 w-36 shrink-0 overflow-hidden rounded-xl">
                  <img src={url} alt={`${recipe.title} ${i + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          );
        })()}

        <Card className="border-cottage-border/60 p-4">
          {recipe.description && <p className="mb-3 text-sm text-cottage-text-sub">{recipe.description}</p>}
          <div className="flex flex-wrap gap-2">
            {recipe.category && <Badge variant="secondary" className="border-0 bg-cottage-surface text-cottage-accent hover:bg-cottage-surface">{CATEGORY_LABELS[recipe.category] ?? recipe.category}</Badge>}
            {recipe.servings && <Badge variant="secondary" className="border-0 bg-cottage-warm text-cottage-text-sub hover:bg-cottage-warm">{recipe.servings}인분</Badge>}
            {recipe.prepTime && <Badge variant="secondary" className="border-0 bg-cottage-warm text-cottage-text-sub hover:bg-cottage-warm">준비 {recipe.prepTime}</Badge>}
            {recipe.cookTime && <Badge variant="secondary" className="border-0 bg-cottage-warm text-cottage-text-sub hover:bg-cottage-warm">조리 {recipe.cookTime}</Badge>}
            {cookCount > 0 && <Badge variant="secondary" className="border-0 bg-cottage-warm text-cottage-text-sub hover:bg-cottage-warm">요리 {cookCount}회</Badge>}
          </div>
          {recipe.sourceUrl && <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 block text-xs text-cottage-accent underline">원본 레시피 보기 →</a>}
        </Card>

        <Card className="border-cottage-border/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-cottage-text">재료</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAdjustedServings(Math.max(1, adjustedServings - 1))}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-cottage-warm text-sm font-bold text-cottage-text-sub active:bg-cottage-border"
              >
                −
              </button>
              <span className="min-w-[3rem] text-center text-sm font-semibold text-cottage-text">
                {adjustedServings}인분
              </span>
              <button
                onClick={() => setAdjustedServings(adjustedServings + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-cottage-warm text-sm font-bold text-cottage-text-sub active:bg-cottage-border"
              >
                +
              </button>
            </div>
          </div>
          <ul className="space-y-2">
            {ingredients.map((ing) => (
              <li key={ing.id} className="flex items-center justify-between text-sm">
                <span className="text-cottage-text">{ing.name}</span>
                <span className="text-cottage-text-muted">
                  {scaleAmount(ing.amount, servingsRatio)}{ing.unit ? ` ${ing.unit}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="border-cottage-border/60 p-4">
          <h3 className="mb-3 font-semibold text-cottage-text">요리 과정</h3>
          <ol className="space-y-4">
            {steps.map((step) => (
              <li key={step.id} className="flex gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cottage-surface text-xs font-bold text-primary">{step.stepNumber}</span>
                <div>
                  <p className="text-cottage-text">{step.instruction}</p>
                  {step.tip && <p className="mt-1 text-xs text-primary">💡 {step.tip}</p>}
                </div>
              </li>
            ))}
          </ol>
        </Card>

        {nutrition && (
          <Card className="border-cottage-border/60 p-4">
            <h3 className="mb-1 font-semibold text-cottage-text">영양 정보</h3>
            <p className="mb-3 text-xs text-cottage-text-muted">AI 추정치 — 참고용으로만 활용하세요</p>
            <div className="grid grid-cols-5 gap-2 text-center text-sm">
              {nutrition.calories != null && <div className="rounded-xl bg-cottage-surface py-2.5"><p className="font-semibold text-cottage-text">{nutrition.calories}</p><p className="text-[0.65rem] text-cottage-text-muted">kcal</p></div>}
              {nutrition.carbohydrates != null && <div className="rounded-xl bg-cottage-surface py-2.5"><p className="font-semibold text-cottage-text">{nutrition.carbohydrates}g</p><p className="text-[0.65rem] text-cottage-text-muted">탄수화물</p></div>}
              {nutrition.protein != null && <div className="rounded-xl bg-cottage-surface py-2.5"><p className="font-semibold text-cottage-text">{nutrition.protein}g</p><p className="text-[0.65rem] text-cottage-text-muted">단백질</p></div>}
              {nutrition.fat != null && <div className="rounded-xl bg-cottage-surface py-2.5"><p className="font-semibold text-cottage-text">{nutrition.fat}g</p><p className="text-[0.65rem] text-cottage-text-muted">지방</p></div>}
              {nutrition.sodium != null && <div className="rounded-xl bg-cottage-surface py-2.5"><p className="font-semibold text-cottage-text">{nutrition.sodium}mg</p><p className="text-[0.65rem] text-cottage-text-muted">나트륨</p></div>}
            </div>
          </Card>
        )}

        {/* 요리 기록 */}
        {cookLogs.length > 0 && (
          <Card className="border-cottage-border/60 p-4">
            <h3 className="mb-3 font-semibold text-cottage-text">요리 기록 ({cookLogs.length}회)</h3>
            <ul className="space-y-3">
              {cookLogs.map((log, i) => (
                <li key={log.id} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cottage-surface text-xs font-bold text-cottage-accent">
                    {cookLogs.length - i}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs text-cottage-text-muted">
                      {new Date(log.cookedAt).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    {log.memo && (
                      <p className="mt-1 text-sm text-cottage-text-sub">{log.memo}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 bg-cottage-bg/95 px-4 pb-6 pt-3 backdrop-blur-sm">
        <Link href={`/recipes/${recipe.id}/cook`} className="flex w-full items-center justify-center rounded-xl bg-cottage-text py-4 text-base font-semibold text-cottage-bg shadow-lg shadow-cottage-text/30 active:opacity-80">
          {cookingProgress ? `이어서 요리하기 (${cookingProgress.currentStep}단계부터)` : "🍳 요리 시작"}
        </Link>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="레시피를 삭제할까요?"
        description="삭제하면 되돌릴 수 없어요."
        confirmLabel="삭제"
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
