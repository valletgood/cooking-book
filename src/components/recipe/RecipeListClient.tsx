"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RecipeCard } from "./RecipeCard";
import { SwipeableCard } from "./SwipeableCard";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useState, useEffect } from "react";

interface Recipe {
  id: number;
  title: string;
  imageUrl: string | null;
  category: string | null;
  isFavorite: boolean;
  ingredientsSummary: string;
  cookCount: number;
}

interface RecipeGroup {
  category: string;
  label: string;
  recipes: Recipe[];
}

interface RecipeListClientProps {
  groups: RecipeGroup[];
}

export function RecipeListClient({ groups }: RecipeListClientProps) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null);
  const [openGroups, setOpenGroups] = useState<string[]>(groups.map((g) => g.category));

  useEffect(() => {
    setOpenGroups((prev) => {
      const newKeys = groups.map((g) => g.category);
      const added = newKeys.filter((k) => !prev.includes(k));
      return [...prev.filter((k) => newKeys.includes(k)), ...added];
    });
  }, [groups]);

  const handleFavorite = async (recipe: Recipe) => {
    await fetch(`/api/recipes/${recipe.id}/favorite`, { method: "PATCH" });
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/recipes/${deleteTarget.id}`, {
      method: "DELETE",
    });
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
      <Accordion
        multiple
        value={openGroups}
        onValueChange={setOpenGroups}
        className="space-y-2"
      >
        {groups.map((group) => (
          <AccordionItem
            key={group.category}
            value={group.category}
            className="rounded-xl border-0"
          >
            <AccordionTrigger className="px-1 py-2 hover:no-underline">
              <div className="flex items-center gap-2">
                <span className="font-heading text-base font-bold text-cottage-text">
                  {group.label}
                </span>
                <span className="rounded-full bg-cottage-warm px-2 py-0.5 text-xs font-semibold text-cottage-text-sub">
                  {group.recipes.length}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2.5 pt-1">
                {group.recipes.map((recipe) => (
                  <SwipeableCard
                    key={recipe.id}
                    onDelete={() => setDeleteTarget(recipe)}
                  >
                    <RecipeCard
                      id={recipe.id}
                      title={recipe.title}
                      imageUrl={recipe.imageUrl}
                      category={recipe.category}
                      isFavorite={recipe.isFavorite}
                      ingredientsSummary={recipe.ingredientsSummary}
                      cookCount={recipe.cookCount}
                      onFavorite={() => handleFavorite(recipe)}
                    />
                  </SwipeableCard>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={`"${deleteTarget?.title}" 삭제할까요?`}
        description="삭제하면 되돌릴 수 없어요."
        confirmLabel="삭제"
        onConfirm={handleDelete}
        destructive
      />
    </>
  );
}
