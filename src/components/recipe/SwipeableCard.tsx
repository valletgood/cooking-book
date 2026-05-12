"use client";

import { useRef, useState, useEffect } from "react";

interface SwipeableCardProps {
  children: React.ReactNode;
  onDelete: () => void;
}

export function SwipeableCard({ children, onDelete }: SwipeableCardProps) {
  const [offsetX, setOffsetX] = useState(0);
  const [swiped, setSwiped] = useState(false);
  const [swiping, setSwiping] = useState(false);
  const touchRef = useRef<{ startX: number; startY: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const THRESHOLD = 80;

  const handleClose = () => {
    setSwiped(false);
    setOffsetX(0);
  };

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
    setSwiping(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchRef.current) return;
    const dx = e.touches[0].clientX - touchRef.current.startX;
    const dy = e.touches[0].clientY - touchRef.current.startY;

    if (Math.abs(dy) > Math.abs(dx)) return;

    // 수평 이동이 감지되면 스와이프 모드 진입
    if (Math.abs(dx) > 5) {
      setSwiping(true);
    }

    if (swiped) {
      if (dx > 0) {
        setOffsetX(Math.min(-THRESHOLD + dx, 0));
      }
    } else {
      if (dx < 0) {
        setOffsetX(Math.max(dx, -THRESHOLD - 20));
      }
    }
  };

  const handleTouchEnd = () => {
    if (!touchRef.current) return;
    touchRef.current = null;

    if (swiped) {
      if (offsetX > -THRESHOLD / 2) {
        handleClose();
      } else {
        setOffsetX(-THRESHOLD);
      }
    } else {
      if (offsetX < -THRESHOLD) {
        setSwiped(true);
        setOffsetX(-THRESHOLD);
      } else {
        setOffsetX(0);
      }
    }

    // 스와이프 후 잠시 링크 클릭 방지 유지
    setTimeout(() => setSwiping(false), 50);
  };

  // 스와이프 중이면 링크 클릭 차단
  const handleClickCapture = (e: React.MouseEvent) => {
    if (swiping || offsetX !== 0) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div ref={cardRef} className="relative overflow-hidden rounded-xl">
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

      <div
        className={`relative z-10 transition-transform duration-200 ease-out ${
          !swiping && offsetX === 0 ? "active:scale-[0.98] active:opacity-90" : ""
        }`}
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClickCapture={handleClickCapture}
      >
        {children}
      </div>
    </div>
  );
}
