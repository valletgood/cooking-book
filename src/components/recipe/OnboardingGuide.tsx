"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    emoji: "📸",
    title: "레시피를 찍어보세요",
    description: "요리책이나 레시피 URL을 입력하면\nAI가 자동으로 정리해줘요",
  },
  {
    emoji: "✏️",
    title: "내 맘대로 수정",
    description: "AI가 분석한 결과를 확인하고\n재료나 과정을 직접 수정할 수 있어요",
  },
  {
    emoji: "🍳",
    title: "따라 요리하기",
    description: "요리 시작 버튼을 누르면\n단계별로 크게 보여드려요",
  },
  {
    emoji: "⏱",
    title: "타이머도 자동으로",
    description: "'5분간 끓인다' 같은 시간이 있으면\n타이머가 자동으로 나타나요",
  },
];

export function OnboardingGuide() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem("cookingbook_onboarding");
    if (!seen) {
      setShow(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("cookingbook_onboarding", "done");
    setShow(false);
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  if (!show) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-end bg-cottage-text/50">
      <div className="w-full rounded-t-3xl bg-cottage-bg px-6 pb-8 pt-6">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-6 bg-cottage-text" : "w-1.5 bg-cottage-border"
                }`}
              />
            ))}
          </div>

          <span className="text-5xl">{current.emoji}</span>
          <h2 className="font-heading text-xl font-bold text-cottage-text">
            {current.title}
          </h2>
          <p className="whitespace-pre-line text-center text-sm text-cottage-text-sub">
            {current.description}
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleClose}
            variant="outline"
            className="h-12 flex-1 rounded-xl border-cottage-border text-base font-semibold text-cottage-text-sub"
          >
            건너뛰기
          </Button>
          <Button
            onClick={handleNext}
            className="h-12 flex-1 rounded-xl bg-cottage-text text-base font-semibold text-cottage-bg hover:bg-cottage-text/90"
          >
            {isLast ? "시작하기" : "다음"}
          </Button>
        </div>
      </div>
    </div>
  );
}
