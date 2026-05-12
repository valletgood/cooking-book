"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RecipeCard } from "./RecipeCard";
import { SwipeableCard } from "./SwipeableCard";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useState } from "react";

interface Recipe {
  id: number;
  title: string;
  imageUrl: string | null;
  category: string | null;
  ingredientsSummary: string;
  cookCount: number;
}

interface RecipeListClientProps {
  recipes: Recipe[];
}

export function RecipeListClient({ recipes }: RecipeListClientProps) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/recipes/${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success(`"${deleteTarget.title}" 삭제되었어요`);
      setDeleteTarget(null);
      router.refresh();
    } else {
      toast.error("삭제에 실패했습니다");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        {recipes.map((recipe) => (
          <SwipeableCard key={recipe.id} onDelete={() => setDeleteTarget(recipe)}>
            <RecipeCard
              id={recipe.id}
              title={recipe.title}
              imageUrl={recipe.imageUrl}
              category={recipe.category}
              ingredientsSummary={recipe.ingredientsSummary}
              cookCount={recipe.cookCount}
            />
          </SwipeableCard>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={`"${deleteTarget?.title}" 삭제할까요?`}
        description="삭제하면 되돌릴 수 없어요."
        confirmLabel="삭제"
        onConfirm={handleDelete}
        destructive
      />
    </>
  );
}
