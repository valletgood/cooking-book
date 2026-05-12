"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CookCompleteModal } from "./CookCompleteModal";
import { CookTimer, extractTimers } from "@/components/recipe/CookTimer";

interface CookModeProps {
  recipeId: number;
  recipeTitle: string;
  steps: { id: number; stepNumber: number; instruction: string; tip: string | null }[];
  ingredients: { id: number; name: string; amount: string | null; unit: string | null }[];
  initialStep: number;
}

export function CookMode({ recipeId, recipeTitle, steps, ingredients, initialStep }: CookModeProps) {
  const router = useRouter();
  const totalSteps = steps.length;
  const [currentIndex, setCurrentIndex] = useState(Math.max(0, Math.min(initialStep - 1, totalSteps - 1)));
  const [showComplete, setShowComplete] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const touchRef = useRef<{ startX: number; startY: number } | null>(null);

  const currentStep = steps[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalSteps - 1;

  const saveProgress = useCallback(async (stepNumber: number | null) => {
    await fetch(`/api/recipes/${recipeId}/cooking-progress`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_step: stepNumber }),
    });
  }, [recipeId]);

  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;
    const requestWakeLock = async () => {
      if ("wakeLock" in navigator) {
        wakeLock = await navigator.wakeLock.request("screen").catch(() => null);
      }
    };
    requestWakeLock();
    const handleVisibility = () => { if (document.visibilityState === "visible") requestWakeLock(); };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => { wakeLock?.release(); document.removeEventListener("visibilitychange", handleVisibility); };
  }, []);

  // 스와이프 제스처
  const handleTouchStart = (e: React.TouchEvent) => {
    touchRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.startX;
    const dy = e.changedTouches[0].clientY - touchRef.current.startY;
    touchRef.current = null;

    if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx)) return;

    if (dx < 0 && !isLast) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      saveProgress(steps[newIndex].stepNumber);
    } else if (dx > 0 && !isFirst) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      saveProgress(steps[newIndex].stepNumber);
    }
  };

  const goToStep = (index: number) => {
    setCurrentIndex(index);
    saveProgress(steps[index].stepNumber);
  };

  const handleNext = () => {
    if (isLast) { setShowComplete(true); return; }
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    saveProgress(steps[newIndex].stepNumber);
  };

  const handlePrev = () => {
    if (isFirst) return;
    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    saveProgress(steps[newIndex].stepNumber);
  };

  const handleClose = () => router.push(`/recipes/${recipeId}`);

  const handleComplete = async (memo: string) => {
    await fetch(`/api/recipes/${recipeId}/cook-log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memo: memo || undefined }),
    });
    router.push(`/recipes/${recipeId}`);
    router.refresh();
  };

  const progressPercent = ((currentIndex + 1) / totalSteps) * 100;

  // 현재 단계에서 사용되는 재료 매칭
  const usedIngredients = useMemo(() => {
    const instruction = currentStep.instruction;
    const tip = currentStep.tip ?? "";
    const text = `${instruction} ${tip}`;
    return ingredients.filter((ing) => text.includes(ing.name));
  }, [currentStep, ingredients]);

  // 현재 단계에서 타이머 추출
  const timers = useMemo(() => {
    const text = `${currentStep.instruction} ${currentStep.tip ?? ""}`;
    return extractTimers(text);
  }, [currentStep]);

  return (
    <div className="flex h-full flex-col bg-cottage-bg" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <header className="bg-cottage-bg px-4 pb-3 pt-4">
        <div className="flex items-center justify-between">
          <h1 className="truncate font-heading text-base font-semibold text-cottage-text-sub">{recipeTitle}</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowIngredients(!showIngredients)} className={`text-sm font-medium ${showIngredients ? "text-primary" : "text-cottage-accent active:text-primary"}`}>재료</button>
            <button onClick={handleClose} className="text-lg text-cottage-text-muted active:text-cottage-text-sub">✕</button>
          </div>
        </div>

        {/* 단계 점프 바 */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto px-1 py-1.5">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => goToStep(i)}
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                i === currentIndex
                  ? "bg-cottage-text text-cottage-bg scale-110"
                  : i < currentIndex
                    ? "bg-cottage-accent text-white"
                    : "bg-cottage-warm text-cottage-text-muted"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="mt-2 flex items-center gap-3">
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-cottage-warm">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-bold text-cottage-text-sub">{currentIndex + 1} / {totalSteps}</span>
        </div>
      </header>

      {showIngredients && (
        <Card className="mx-4 mb-2 border-cottage-border/60 bg-cottage-surface p-4">
          <h3 className="mb-2 text-sm font-semibold text-cottage-accent">전체 재료</h3>
          <ul className="space-y-1.5">
            {ingredients.map((ing) => (
              <li key={ing.id} className="flex justify-between text-sm">
                <span className="text-cottage-text">{ing.name}</span>
                <span className="text-cottage-text-muted">{ing.amount}{ing.unit ? ` ${ing.unit}` : ""}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <main className="flex flex-1 flex-col items-center justify-center px-8">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cottage-text text-xl font-bold text-cottage-bg">{currentStep.stepNumber}</span>

        {/* 이 단계에서 사용되는 재료 */}
        {usedIngredients.length > 0 && (
          <div className="mb-5 flex flex-wrap justify-center gap-2">
            {usedIngredients.map((ing) => (
              <span
                key={ing.id}
                className="rounded-full bg-cottage-surface px-3 py-1 text-sm text-cottage-accent"
              >
                {ing.name} {ing.amount}{ing.unit ? ` ${ing.unit}` : ""}
              </span>
            ))}
          </div>
        )}

        <p className="text-center text-xl font-medium leading-relaxed text-cottage-text">{currentStep.instruction}</p>
        {currentStep.tip && (
          <div className="mt-5 rounded-xl bg-cottage-surface px-5 py-3">
            <p className="text-center text-sm text-cottage-accent">💡 {currentStep.tip}</p>
          </div>
        )}

        {/* 타이머 */}
        {timers.map((timer, i) => (
          <CookTimer key={`${currentIndex}-${i}`} seconds={timer.seconds} label={timer.label} />
        ))}

        <p className="mt-6 text-xs text-cottage-text-muted">← 스와이프로 단계 이동 →</p>
      </main>

      <div className="px-4 pb-8 pt-4">
        <div className="flex gap-3">
          <Button onClick={handlePrev} disabled={isFirst} variant="outline" className="h-14 flex-1 rounded-xl border-cottage-border text-lg font-semibold text-cottage-text-sub">이전</Button>
          <Button onClick={handleNext} className="h-14 flex-[2] rounded-xl bg-cottage-text text-lg font-semibold text-cottage-bg hover:bg-cottage-text/90">{isLast ? "🎉 요리 완료!" : "다음"}</Button>
        </div>
      </div>

      {showComplete && <CookCompleteModal onComplete={handleComplete} onClose={() => setShowComplete(false)} />}
    </div>
  );
}
