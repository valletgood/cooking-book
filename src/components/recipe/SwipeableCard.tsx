"use client";

import { useRef, useState, useEffect } from "react";

interface SwipeableCardProps {
  children: React.ReactNode;
  onDelete: () => void;
}

export function SwipeableCard({ children, onDelete }: SwipeableCardProps) {
  const [offsetX, setOffsetX] = useState(0);
  const [swiped, setSwiped] = useState(false);
  const touchRef = useRef<{ startX: number; startY: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const THRESHOLD = 80;

  const handleClose = () => {
    setSwiped(false);
    setOffsetX(0);
  };

  // 다른 곳 클릭 시 닫기
  useEffect(() => {
    if (!swiped) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener("touchstart", handleOutsideClick);
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [swiped]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchRef.current = {
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchRef.current) return;
    const dx = e.touches[0].clientX - touchRef.current.startX;
    const dy = e.touches[0].clientY - touchRef.current.startY;

    if (Math.abs(dy) > Math.abs(dx)) return;

    if (swiped) {
      // 열린 상태에서 우측 스와이프 → 닫기
      if (dx > 0) {
        setOffsetX(Math.min(-THRESHOLD + dx, 0));
      }
    } else {
      // 닫힌 상태에서 좌측 스와이프 → 열기
      if (dx < 0) {
        setOffsetX(Math.max(dx, -THRESHOLD - 20));
      }
    }
  };

  const handleTouchEnd = () => {
    if (!touchRef.current) return;
    touchRef.current = null;

    if (swiped) {
      // 열린 상태에서 일정 이상 우측으로 당겼으면 닫기
      if (offsetX > -THRESHOLD / 2) {
        handleClose();
      } else {
        setOffsetX(-THRESHOLD);
      }
    } else {
      // 닫힌 상태에서 일정 이상 좌측으로 당겼으면 열기
      if (offsetX < -THRESHOLD) {
        setSwiped(true);
        setOffsetX(-THRESHOLD);
      } else {
        setOffsetX(0);
      }
    }
  };

  return (
    <div ref={cardRef} className="relative rounded-xl">
      {/* 삭제 영역 — 전체 배경으로 깔고 카드가 위에서 밀림 */}
      <div
        className={`absolute inset-0 flex items-center justify-end rounded-xl bg-red-500 transition-opacity ${
          offsetX < 0 ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="mr-5 text-sm font-semibold text-white"
        >
          삭제
        </button>
      </div>

      {/* 카드 본체 */}
      <div
        className="relative z-10 transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
