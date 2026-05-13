import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS } from "@/lib/constants";

interface RecipeCardProps {
  id: number;
  title: string;
  imageUrl: string | null;
  category: string | null;
  isFavorite: boolean;
  ingredientsSummary: string;
  cookCount: number;
  onFavorite?: () => void;
}

export function RecipeCard({
  id,
  title,
  imageUrl,
  category,
  isFavorite,
  ingredientsSummary,
  cookCount,
  onFavorite,
}: RecipeCardProps) {
  let thumb: string | null = null;
  if (imageUrl) {
    thumb = imageUrl;
    try {
      const p = JSON.parse(imageUrl);
      if (Array.isArray(p) && p[0]) thumb = p[0];
    } catch {}
  }

  return (
    <div className="relative">
      <Link href={`/recipes/${id}`}>
        <Card className="flex flex-row items-center gap-4 border-cottage-border/60 bg-white p-3 pr-10">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-cottage-surface">
            {thumb ? (
              <img src={thumb} alt={title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl">
                🍳
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
            <h3 className="truncate text-[0.95rem] font-semibold text-cottage-text">
              {title}
            </h3>
            <p className="truncate text-xs text-cottage-text-sub">
              {ingredientsSummary}
            </p>
            <div className="flex items-center gap-2">
              {category && (
                <Badge
                  variant="secondary"
                  className="border-0 bg-cottage-surface px-1.5 py-0 text-[0.65rem] text-cottage-accent hover:bg-cottage-surface"
                >
                  {CATEGORY_LABELS[category] ?? category}
                </Badge>
              )}
              {cookCount > 0 && (
                <span className="text-[0.65rem] text-cottage-text-muted">
                  요리 {cookCount}회
                </span>
              )}
            </div>
          </div>
        </Card>
      </Link>

      {onFavorite && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onFavorite();
          }}
          className="absolute top-3 right-3 z-10 p-1 text-lg transition-transform active:scale-125"
        >
          {isFavorite ? "❤️" : "🤍"}
        </button>
      )}
    </div>
  );
}
