"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORY_OPTIONS } from "@/lib/constants";

export interface EditableRecipe {
  title: string;
  description: string;
  category: string;
  servings: number;
  prep_time: string;
  cook_time: string;
  ingredients: { name: string; amount: string; unit: string }[];
  steps: { step_number: number; instruction: string; tip: string }[];
  nutrition: {
    calories: number;
    carbohydrates: number;
    protein: number;
    fat: number;
    sodium: number;
  } | null;
}

interface RecipeEditFormProps {
  recipe: EditableRecipe;
  onUpdate: (recipe: EditableRecipe) => void;
}

export function RecipeEditForm({ recipe, onUpdate }: RecipeEditFormProps) {
  const updateField = <K extends keyof EditableRecipe>(
    key: K,
    value: EditableRecipe[K],
  ) => {
    onUpdate({ ...recipe, [key]: value });
  };

  const updateIngredient = (index: number, field: string, value: string) => {
    const updated = recipe.ingredients.map((ing, i) =>
      i === index ? { ...ing, [field]: value } : ing,
    );
    updateField("ingredients", updated);
  };

  const removeIngredient = (index: number) => {
    updateField("ingredients", recipe.ingredients.filter((_, i) => i !== index));
  };

  const addIngredient = () => {
    updateField("ingredients", [
      ...recipe.ingredients,
      { name: "", amount: "", unit: "" },
    ]);
  };

  const updateStep = (index: number, field: string, value: string) => {
    const updated = recipe.steps.map((step, i) =>
      i === index ? { ...step, [field]: value } : step,
    );
    updateField("steps", updated);
  };

  const removeStep = (index: number) => {
    const updated = recipe.steps
      .filter((_, i) => i !== index)
      .map((step, i) => ({ ...step, step_number: i + 1 }));
    updateField("steps", updated);
  };

  const addStep = () => {
    updateField("steps", [
      ...recipe.steps,
      { step_number: recipe.steps.length + 1, instruction: "", tip: "" },
    ]);
  };

  return (
    <div className="space-y-3">
      <Card className="space-y-3 border-cottage-border/60 p-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-cottage-text-sub">제목</label>
          <Input
            value={recipe.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="border-cottage-border bg-white text-cottage-text focus-visible:ring-primary/30"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-cottage-text-sub">설명</label>
          <Textarea
            value={recipe.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={2}
            className="resize-none border-cottage-border bg-white text-cottage-text focus-visible:ring-primary/30"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-cottage-text-sub">카테고리</label>
            <select
              value={recipe.category}
              onChange={(e) => updateField("category", e.target.value)}
              className="h-9 w-full rounded-lg border border-cottage-border bg-white px-3 text-sm text-cottage-text focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-cottage-text-sub">인분</label>
            <Input
              type="number"
              value={recipe.servings}
              onChange={(e) => updateField("servings", Number(e.target.value))}
              min={1}
              className="border-cottage-border bg-white text-cottage-text focus-visible:ring-primary/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-cottage-text-sub">준비 시간</label>
            <Input
              value={recipe.prep_time}
              onChange={(e) => updateField("prep_time", e.target.value)}
              placeholder="예: 15분"
              className="border-cottage-border bg-white text-cottage-text focus-visible:ring-primary/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-cottage-text-sub">조리 시간</label>
            <Input
              value={recipe.cook_time}
              onChange={(e) => updateField("cook_time", e.target.value)}
              placeholder="예: 30분"
              className="border-cottage-border bg-white text-cottage-text focus-visible:ring-primary/30"
            />
          </div>
        </div>
      </Card>

      <Card className="border-cottage-border/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-cottage-text">재료</h3>
          <button onClick={addIngredient} className="text-sm font-medium text-cottage-accent active:text-primary">+ 추가</button>
        </div>
        <ul className="space-y-2">
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className="flex items-center gap-2">
              <Input value={ing.name} onChange={(e) => updateIngredient(i, "name", e.target.value)} placeholder="재료명" className="flex-[3] border-cottage-border bg-white text-sm text-cottage-text focus-visible:ring-primary/30" />
              <Input value={ing.amount} onChange={(e) => updateIngredient(i, "amount", e.target.value)} placeholder="분량" className="flex-[1.5] border-cottage-border bg-white text-sm text-cottage-text focus-visible:ring-primary/30" />
              <Input value={ing.unit} onChange={(e) => updateIngredient(i, "unit", e.target.value)} placeholder="단위" className="flex-1 border-cottage-border bg-white text-sm text-cottage-text focus-visible:ring-primary/30" />
              <button onClick={() => removeIngredient(i)} className="shrink-0 text-sm text-red-300 active:text-red-500">✕</button>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="border-cottage-border/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-cottage-text">요리 과정</h3>
          <button onClick={addStep} className="text-sm font-medium text-cottage-accent active:text-primary">+ 추가</button>
        </div>
        <ol className="space-y-4">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cottage-surface text-xs font-bold text-primary">{step.step_number}</span>
              <div className="flex-1 space-y-2">
                <Textarea value={step.instruction} onChange={(e) => updateStep(i, "instruction", e.target.value)} rows={2} placeholder="조리 방법" className="resize-none border-cottage-border bg-white text-sm text-cottage-text focus-visible:ring-primary/30" />
                <Input value={step.tip} onChange={(e) => updateStep(i, "tip", e.target.value)} placeholder="💡 팁 (선택)" className="border-cottage-border bg-white text-sm text-cottage-text focus-visible:ring-primary/30" />
              </div>
              <button onClick={() => removeStep(i)} className="shrink-0 self-start pt-1 text-sm text-red-300 active:text-red-500">✕</button>
            </li>
          ))}
        </ol>
      </Card>

      {recipe.nutrition && (
        <Card className="border-cottage-border/60 p-4">
          <h3 className="mb-1 font-semibold text-cottage-text">영양 정보</h3>
          <p className="mb-3 text-xs text-cottage-text-muted">AI 추정치 — 수정 가능합니다</p>
          <div className="grid grid-cols-5 gap-2">
            {([["calories", "kcal"], ["carbohydrates", "탄수화물"], ["protein", "단백질"], ["fat", "지방"], ["sodium", "나트륨"]] as const).map(([key, label]) => (
              <div key={key}>
                <label className="mb-1 block text-center text-[0.65rem] text-cottage-text-muted">{label}</label>
                <Input
                  type="number"
                  value={recipe.nutrition![key] ?? ""}
                  onChange={(e) => updateField("nutrition", { ...recipe.nutrition!, [key]: Number(e.target.value) })}
                  className="border-cottage-border bg-cottage-surface text-center text-sm font-semibold text-cottage-text focus-visible:ring-primary/30"
                />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
