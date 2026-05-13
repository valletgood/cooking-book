"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-cottage-bg px-8">
      <Image
        src="/images/coco_error.png"
        alt="오류가 발생했어요"
        width={160}
        height={160}
        className="h-auto"
      />
      <h1 className="mt-4 font-heading text-xl font-bold text-cottage-text">
        앗, 뭔가 잘못됐어요!
      </h1>
      <p className="mt-2 text-center text-sm text-cottage-text-sub">
        코코가 실수했나봐요...
        <br />
        다시 시도해주세요
      </p>
      <div className="mt-6 flex gap-3">
        <Button
          onClick={() => (window.location.href = "/")}
          variant="outline"
          className="h-11 rounded-xl border-cottage-border px-6 text-sm font-semibold text-cottage-text-sub"
        >
          홈으로
        </Button>
        <Button
          onClick={reset}
          className="h-11 rounded-xl bg-cottage-text px-6 text-sm font-semibold text-cottage-bg hover:bg-cottage-text/90"
        >
          다시 시도
        </Button>
      </div>
    </div>
  );
}
