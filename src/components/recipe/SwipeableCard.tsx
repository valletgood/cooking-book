"use client";

import { useRef, useState } from "react";

interface SwipeableCardProps {
  children: React.ReactNode;
  onDelete: () => void;
}

export function SwipeableCard({ children, onDelete }: SwipeableCardProps) {
  const [offsetX, setOffsetX] = useState(0);
  const [swiped, setSwiped] = useState(false);
  const touchRef = useRef<{ startX: number; startY: number } | null>(null);
  const THRESHOLD = 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (swiped) return;
    touchRef.current = {
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchRef.current || swiped) return;
    const dx = e.touches[0].clientX - touchRef.current.startX;
    const dy = e.touches[0].clientY - touchRef.current.startY;

    if (Math.abs(dy) > Math.abs(dx)) return;

    if (dx < 0) {
      setOffsetX(Math.max(dx, -THRESHOLD - 20));
    }
  };

  const handleTouchEnd = () => {
    if (!touchRef.current || swiped) return;
    touchRef.current = null;

    if (offsetX < -THRESHOLD) {
      setSwiped(true);
      setOffsetX(-THRESHOLD);
    } else {
      setOffsetX(0);
    }
  };

  const handleClose = () => {
    setSwiped(false);
    setOffsetX(0);
  };

  return (
    <div className="relative overflow-hidden rounded-xl" onClick={swiped ? handleClose : undefined}>
      {/* 삭제 영역 */}
      <div className="absolute inset-y-0 right-0 flex w-20 items-center justify-center bg-red-500 rounded-r-xl">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-sm font-semibold text-white"
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
