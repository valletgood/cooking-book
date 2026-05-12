import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  recipes,
  recipeIngredients,
  recipeSteps,
  recipeNutrition,
  cookLogs,
} from "@/db/schema";
import { eq, desc, sql, or, ilike } from "drizzle-orm";
import type { ParsedRecipe } from "@/types/recipe";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  const baseWhere = eq(recipes.userId, session.user.id);

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
            SELECT 1 FROM ${recipeIngredients}
            WHERE ${recipeIngredients.recipeId} = ${recipes.id}
            AND ${ilike(recipeIngredients.name, `%${q}%`)}
          ))`
        : baseWhere,
    )
    .orderBy(desc(recipes.createdAt));

  const recipesWithMeta = await Promise.all(
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

  return NextResponse.json({ recipes: recipesWithMeta });
}

interface CreateRecipeBody extends ParsedRecipe {
  source_type: "url" | "image";
  source_url?: string;
  image_url?: string;
  images?: string;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: CreateRecipeBody = await request.json();

  if (!body.title || !body.ingredients?.length || !body.steps?.length) {
    return NextResponse.json(
      { error: "필수 필드가 누락되었습니다 (title, ingredients, steps)" },
      { status: 400 },
    );
  }

  const [recipe] = await db
    .insert(recipes)
    .values({
      userId: session.user.id,
      title: body.title,
      description: body.description,
      category: body.category,
      sourceType: body.source_type,
      sourceUrl: body.source_url,
      imageUrl: body.images ?? body.image_url ?? null,
      servings: body.servings,
      prepTime: body.prep_time,
      cookTime: body.cook_time,
    })
    .returning({ id: recipes.id });

  await db.insert(recipeIngredients).values(
    body.ingredients.map((ing, idx) => ({
      recipeId: recipe.id,
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      orderIndex: idx,
    })),
  );

  await db.insert(recipeSteps).values(
    body.steps.map((step) => ({
      recipeId: recipe.id,
      stepNumber: step.step_number,
      instruction: step.instruction,
      tip: step.tip || null,
    })),
  );

  if (body.nutrition) {
    await db.insert(recipeNutrition).values({
      recipeId: recipe.id,
      calories: body.nutrition.calories,
      carbohydrates: body.nutrition.carbohydrates,
      protein: body.nutrition.protein,
      fat: body.nutrition.fat,
      sodium: body.nutrition.sodium,
    });
  }

  return NextResponse.json({ id: recipe.id, title: body.title }, { status: 201 });
}
