"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface CookTimerProps {
  seconds: number;
  label: string;
}

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

  // 단계 변경 시 리셋
  useEffect(() => {
    clear();
    setRemaining(seconds);
    setRunning(false);
    setFinished(false);
  }, [seconds, clear]);

  const handleStart = () => {
    if (finished) {
      setRemaining(seconds);
      setFinished(false);
    }
    setRunning(true);
  };

  const handleStop = () => {
    clear();
    setRunning(false);
  };

  const handleReset = () => {
    clear();
    setRemaining(seconds);
    setRunning(false);
    setFinished(false);
  };

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return min > 0
      ? `${min}:${sec.toString().padStart(2, "0")}`
      : `0:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`mt-4 flex items-center gap-3 rounded-xl px-4 py-3 ${
        finished
          ? "bg-primary/10 ring-2 ring-primary/30"
          : "bg-cottage-surface"
      }`}
    >
      <div className="flex-1">
        <p className="text-xs text-cottage-text-muted">⏱ {label}</p>
        <p
          className={`font-heading text-2xl font-bold tabular-nums ${
            finished ? "text-primary" : "text-cottage-text"
          }`}
        >
          {finished ? "완료!" : formatTime(remaining)}
        </p>
      </div>

      <div className="flex gap-2">
        {!running && !finished && (
          <Button
            onClick={handleStart}
            className="h-9 rounded-lg bg-cottage-text px-4 text-sm font-semibold text-cottage-bg hover:bg-cottage-text/90"
          >
            {remaining === seconds ? "시작" : "계속"}
          </Button>
        )}
        {running && (
          <Button
            onClick={handleStop}
            variant="outline"
            className="h-9 rounded-lg border-cottage-border px-4 text-sm font-semibold text-cottage-text-sub"
          >
            일시정지
          </Button>
        )}
        {(finished || (remaining !== seconds && !running)) && (
          <Button
            onClick={handleReset}
            variant="outline"
            className="h-9 rounded-lg border-cottage-border px-4 text-sm font-semibold text-cottage-text-sub"
          >
            초기화
          </Button>
        )}
      </div>
    </div>
  );
}

// "5분", "10분간", "30초", "1시간" 등의 패턴에서 초 단위로 추출
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
