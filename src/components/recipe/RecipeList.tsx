import Link from "next/link";
import Image from "next/image";
import { RecipeCard } from "./RecipeCard";
import { db } from "@/db";
import { recipes, recipeIngredients, cookLogs } from "@/db/schema";
import { eq, desc, sql, ilike } from "drizzle-orm";

interface RecipeListProps {
  userId: string;
  q?: string;
}

async function getRecipes(userId: string, q?: string) {
  const baseWhere = eq(recipes.userId, userId);

  const recipeList = await db
    .select({
      id: recipes.id,
      title: recipes.title,
      imageUrl: recipes.imageUrl,
      category: recipes.category,
      sourceType: recipes.sourceType,
      createdAt: recipes.createdAt,
    })
    .from(recipes)
    .where(
      q
        ? sql`${baseWhere} AND (${ilike(recipes.title, `%${q}%`)} OR EXISTS (
            SELECT 1 FROM recipe_ingredients
            WHERE recipe_ingredients.recipe_id = ${recipes.id}
            AND ${ilike(recipeIngredients.name, `%${q}%`)}
          ))`
        : baseWhere,
    )
    .orderBy(desc(recipes.createdAt));

  return Promise.all(
    recipeList.map(async (recipe) => {
      const ingredients = await db
        .select({ name: recipeIngredients.name })
        .from(recipeIngredients)
        .where(eq(recipeIngredients.recipeId, recipe.id))
        .orderBy(recipeIngredients.orderIndex)
        .limit(5);

      const [cookCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(cookLogs)
        .where(eq(cookLogs.recipeId, recipe.id));

      return {
        ...recipe,
        ingredientsSummary: ingredients.map((i) => i.name).join(", "),
        cookCount: cookCount?.count ?? 0,
      };
    }),
  );
}

export async function RecipeList({ userId, q }: RecipeListProps) {
  const recipeList = await getRecipes(userId, q);

  if (recipeList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 pt-24">
        <Image
          src="/images/coco_empty.png"
          alt="레시피가 없어요"
          width={140}
          height={140}
          className="h-auto"
        />
        <p className="text-center text-[0.95rem] text-cottage-text-sub">
          {q ? `"${q}" 검색 결과가 없어요` : "아직 저장된 레시피가 없어요"}
        </p>
        {!q && (
          <Link
            href="/recipes/new"
            className="mt-2 inline-flex h-12 items-center rounded-xl bg-cottage-text px-8 text-base font-semibold text-cottage-bg active:opacity-80"
          >
            첫 레시피 추가하기
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {recipeList.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          id={recipe.id}
          title={recipe.title}
          imageUrl={recipe.imageUrl}
          category={recipe.category}
          ingredientsSummary={recipe.ingredientsSummary}
          cookCount={recipe.cookCount}
        />
      ))}
    </div>
  );
}
