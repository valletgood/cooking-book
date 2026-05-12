"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

interface CookCompleteModalProps {
  onComplete: (memo: string) => Promise<void>;
  onClose: () => void;
}

export function CookCompleteModal({ onComplete, onClose }: CookCompleteModalProps) {
  const [memo, setMemo] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => { setSaving(true); await onComplete(memo); };
  const handleSkip = async () => { setSaving(true); await onComplete(""); };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-cottage-text/50">
      <div className="w-full rounded-t-3xl bg-cottage-bg px-6 pb-8 pt-6">
        <div className="mb-5 text-center">
          <span className="text-5xl">🎉</span>
          <h2 className="mt-3 font-heading text-xl font-extrabold text-cottage-text">요리 완료!</h2>
          <p className="mt-1 text-sm text-cottage-text-sub">코코가 축하해요!</p>
        </div>
        <div className="mb-5">
          <label className="mb-1.5 block text-sm font-semibold text-cottage-text">후기 메모 (선택)</label>
          <Textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="요리 후기를 남겨보세요..."
            rows={3}
            disabled={saving}
            className="resize-none rounded-xl border-cottage-border bg-white text-base placeholder:text-cottage-text-muted focus-visible:ring-primary/30"
          />
        </div>
        <div className="flex gap-3">
          <Button onClick={handleSkip} disabled={saving} variant="outline" className="h-12 flex-1 rounded-xl border-cottage-border text-base font-semibold text-cottage-text-sub">건너뛰기</Button>
          <Button onClick={handleSave} disabled={saving} className="h-12 flex-1 rounded-xl bg-cottage-text text-base font-semibold text-cottage-bg hover:bg-cottage-text/90">{saving ? <><Spinner size="sm" /> 저장 중...</> : "저장"}</Button>
        </div>
        <button onClick={onClose} disabled={saving} className="mt-3 w-full py-2 text-sm text-cottage-text-muted active:text-cottage-text-sub">계속 요리하기</button>
      </div>
    </div>
  );
}
