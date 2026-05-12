import Link from "next/link";
import Image from "next/image";
import { RecipeListClient } from "./RecipeListClient";
import { db } from "@/db";
import { recipes, recipeIngredients, cookLogs } from "@/db/schema";
import { eq, desc, asc, sql, ilike } from "drizzle-orm";

interface RecipeListProps {
  userId: string;
  q?: string;
  category?: string;
  sort?: string;
}

async function getRecipes(userId: string, q?: string, category?: string, sort?: string) {
  const conditions = [eq(recipes.userId, userId)];

  if (category && category !== "all") {
    conditions.push(eq(recipes.category, category));
  }

  const whereClause = q
    ? sql`${sql.join(conditions, sql` AND `)} AND (${ilike(recipes.title, `%${q}%`)} OR EXISTS (
        SELECT 1 FROM recipe_ingredients
        WHERE recipe_ingredients.recipe_id = ${recipes.id}
        AND ${ilike(recipeIngredients.name, `%${q}%`)}
      ))`
    : sql`${sql.join(conditions, sql` AND `)}`;

  let orderBy;
  switch (sort) {
    case "name":
      orderBy = asc(recipes.title);
      break;
    case "cook_count":
      orderBy = undefined; // 후처리로 정렬
      break;
    default:
      orderBy = desc(recipes.createdAt);
  }

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
    .where(whereClause)
    .orderBy(orderBy ?? desc(recipes.createdAt));

  const withMeta = await Promise.all(
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

  if (sort === "cook_count") {
    withMeta.sort((a, b) => b.cookCount - a.cookCount);
  }

  return withMeta;
}

export async function RecipeList({ userId, q, category, sort }: RecipeListProps) {
  const recipeList = await getRecipes(userId, q, category, sort);

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
          {q
            ? `"${q}" 검색 결과가 없어요`
            : category && category !== "all"
              ? "이 카테고리에 레시피가 없어요"
              : "아직 저장된 레시피가 없어요"}
        </p>
        {!q && !category && (
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

  return <RecipeListClient recipes={recipeList} />;
}
