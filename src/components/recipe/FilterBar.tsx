"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORY_LABELS } from "@/lib/constants";

const SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "name", label: "이름순" },
  { value: "cook_count", label: "많이 요리한순" },
];

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") ?? "all";
  const currentSort = searchParams.get("sort") ?? "latest";

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "latest") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  };

  return (
    <div className="space-y-2">
      {/* 카테고리 필터 */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => updateParams("category", "all")}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
            currentCategory === "all"
              ? "bg-cottage-text text-cottage-bg"
              : "bg-cottage-warm text-cottage-text-sub active:bg-cottage-border"
          }`}
        >
          전체
        </button>
        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
          <button
            key={value}
            onClick={() => updateParams("category", value)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              currentCategory === value
                ? "bg-cottage-text text-cottage-bg"
                : "bg-cottage-warm text-cottage-text-sub active:bg-cottage-border"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 정렬 */}
      <div className="flex items-center gap-1.5">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => updateParams("sort", opt.value)}
            className={`text-xs font-medium transition-colors ${
              currentSort === opt.value
                ? "text-cottage-accent"
                : "text-cottage-text-muted active:text-cottage-text-sub"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
