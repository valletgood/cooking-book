"use client";

import { Button } from "@/components/ui/button";
import { RecipeEditForm, type EditableRecipe } from "@/components/recipe/RecipeEditForm";
import type { ParsedRecipe } from "@/types/recipe";

interface ParsedRecipePreviewProps {
  recipe: ParsedRecipe;
  onUpdate: (recipe: ParsedRecipe) => void;
  onSave: () => void;
  onReset: () => void;
  saving: boolean;
}

export function ParsedRecipePreview({ recipe, onUpdate, onSave, onReset, saving }: ParsedRecipePreviewProps) {
  return (
    <div className="flex min-h-full flex-col bg-cottage-bg">
      <header className="sticky top-0 z-10 bg-cottage-bg/95 px-4 pb-2 pt-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button onClick={onReset} className="text-lg text-cottage-text-sub active:text-cottage-text">←</button>
          <h1 className="font-heading text-xl font-extrabold text-cottage-text">파싱 결과 확인</h1>
        </div>
        <p className="mt-1 text-xs text-cottage-text-muted">내용을 확인하고 필요하면 수정하세요</p>
      </header>
      <main className="flex-1 px-4 pb-32 pt-2">
        <RecipeEditForm recipe={recipe} onUpdate={(updated) => onUpdate(updated as ParsedRecipe)} />
      </main>
      <div className="fixed inset-x-0 bottom-0 bg-cottage-bg/95 px-4 pb-6 pt-3 backdrop-blur-sm">
        <div className="flex gap-3">
          <Button onClick={onReset} variant="outline" className="h-12 flex-1 rounded-xl border-cottage-border text-base font-semibold text-cottage-text-sub">다시 분석</Button>
          <Button onClick={onSave} disabled={saving} className="h-12 flex-1 rounded-xl bg-cottage-text text-base font-semibold text-cottage-bg hover:bg-cottage-text/90">{saving ? "저장 중..." : "저장하기"}</Button>
        </div>
      </div>
    </div>
  );
}
