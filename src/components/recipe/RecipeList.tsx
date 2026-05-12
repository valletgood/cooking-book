import Link from "next/link";
import Image from "next/image";
import { RecipeListClient } from "./RecipeListClient";
import { db } from "@/db";
import { recipes, recipeIngredients, cookLogs } from "@/db/schema";
import { eq, desc, asc, sql, ilike } from "drizzle-orm";
import { CATEGORY_LABELS } from "@/lib/constants";

interface RecipeListProps {
  userId: string;
  q?: string;
  sort?: string;
}

async function getRecipes(userId: string, q?: string, sort?: string) {
  const baseWhere = eq(recipes.userId, userId);

  const whereClause = q
    ? sql`${baseWhere} AND (${ilike(recipes.title, `%${q}%`)} OR EXISTS (
        SELECT 1 FROM recipe_ingredients
        WHERE recipe_ingredients.recipe_id = ${recipes.id}
        AND ${ilike(recipeIngredients.name, `%${q}%`)}
      ))`
    : baseWhere;

  let orderBy;
  switch (sort) {
    case "name":
      orderBy = asc(recipes.title);
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
    .orderBy(orderBy);

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

type RecipeWithMeta = Awaited<ReturnType<typeof getRecipes>>[number];

function groupByCategory(list: RecipeWithMeta[]) {
  const groups: Record<string, RecipeWithMeta[]> = {};

  for (const recipe of list) {
    const cat = recipe.category ?? "other";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(recipe);
  }

  // CATEGORY_LABELS 순서대로 정렬
  const orderedKeys = Object.keys(CATEGORY_LABELS);
  const sorted: { category: string; label: string; recipes: RecipeWithMeta[] }[] = [];

  for (const key of orderedKeys) {
    if (groups[key]) {
      sorted.push({
        category: key,
        label: CATEGORY_LABELS[key],
        recipes: groups[key],
      });
    }
  }

  // CATEGORY_LABELS에 없는 카테고리가 있으면 마지막에 추가
  for (const key of Object.keys(groups)) {
    if (!orderedKeys.includes(key)) {
      sorted.push({
        category: key,
        label: key,
        recipes: groups[key],
      });
    }
  }

  return sorted;
}

export async function RecipeList({ userId, q, sort }: RecipeListProps) {
  const recipeList = await getRecipes(userId, q, sort);

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

  const groups = groupByCategory(recipeList);

  return <RecipeListClient groups={groups} />;
}
