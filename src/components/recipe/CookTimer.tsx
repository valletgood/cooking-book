"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface CookTimerProps {
  seconds: number;
  label: string;
}

const RING_SIZE = 100;
const STROKE_WIDTH = 6;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CookTimer({ seconds, label }: CookTimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clear();
          setRunning(false);
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return clear;
  }, [running, clear]);

  useEffect(() => {
    clear();
    setRemaining(seconds);
    setRunning(false);
    setFinished(false);
  }, [seconds, clear]);

  const handleTap = () => {
    if (finished) {
      setRemaining(seconds);
      setFinished(false);
      return;
    }
    if (running) {
      clear();
      setRunning(false);
    } else {
      setRunning(true);
    }
  };

  const handleLongPress = () => {
    clear();
    setRemaining(seconds);
    setRunning(false);
    setFinished(false);
  };

  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleTouchStart = () => {
    longPressRef.current = setTimeout(handleLongPress, 600);
  };
  const handleTouchEnd = () => {
    if (longPressRef.current) clearTimeout(longPressRef.current);
  };

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const progress = 1 - remaining / seconds;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="mt-5 flex flex-col items-center gap-2">
      <p className="text-xs font-medium text-cottage-text-muted">⏱ {label}</p>

      <button
        onClick={handleTap}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="relative outline-none active:scale-95 transition-transform"
      >
        {/* 링 배경 */}
        <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90">
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--color-cottage-warm)"
            strokeWidth={STROKE_WIDTH}
          />
          {/* 진행 링 */}
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={finished ? "var(--color-cottage-accent)" : "var(--color-cottage-text)"}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        {/* 중앙 텍스트 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {finished ? (
            <span className="font-heading text-lg font-bold text-cottage-accent">완료!</span>
          ) : (
            <>
              <span className="font-heading text-xl font-bold tabular-nums text-cottage-text">
                {formatTime(remaining)}
              </span>
              <span className="text-[0.6rem] text-cottage-text-muted">
                {running ? "탭하여 일시정지" : "탭하여 시작"}
              </span>
            </>
          )}
        </div>
      </button>

      {/* 꾹 눌러서 초기화 안내 — 진행 중일 때만 */}
      {(remaining !== seconds || finished) && (
        <p className="text-[0.6rem] text-cottage-text-muted">꾹 눌러서 초기화</p>
      )}
    </div>
  );
}

export function extractTimers(text: string): { seconds: number; label: string }[] {
  const timers: { seconds: number; label: string }[] = [];
  const regex = /(\d+)\s*(시간|분|초)\s*(간|정도|동안)?/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const value = parseInt(match[1]);
    const unit = match[2];

    let seconds = 0;
    switch (unit) {
      case "시간":
        seconds = value * 3600;
        break;
      case "분":
        seconds = value * 60;
        break;
      case "초":
        seconds = value;
        break;
    }

    if (seconds > 0 && seconds <= 7200) {
      timers.push({ seconds, label: match[0] });
    }
  }

  return timers;
}
