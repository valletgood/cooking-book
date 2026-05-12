import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS } from "@/lib/constants";

interface RecipeCardProps {
  id: number;
  title: string;
  imageUrl: string | null;
  category: string | null;
  ingredientsSummary: string;
  cookCount: number;
}

export function RecipeCard({
  id,
  title,
  imageUrl,
  category,
  ingredientsSummary,
  cookCount,
}: RecipeCardProps) {
  return (
    <Link href={`/recipes/${id}`}>
      <Card className="flex gap-4 border-cottage-border/60 bg-white p-4 transition-all active:scale-[0.98] active:bg-cottage-bg">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-cottage-surface">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl">
              🍳
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
          <h3 className="truncate text-base font-semibold text-cottage-text">
            {title}
          </h3>
          <p className="truncate text-sm text-cottage-text-sub">
            {ingredientsSummary}
          </p>
          <div className="flex items-center gap-2">
            {category && (
              <Badge
                variant="secondary"
                className="border-0 bg-cottage-surface text-cottage-accent hover:bg-cottage-surface"
              >
                {CATEGORY_LABELS[category] ?? category}
              </Badge>
            )}
            {cookCount > 0 && (
              <span className="text-xs text-cottage-text-muted">
                요리 {cookCount}회
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
