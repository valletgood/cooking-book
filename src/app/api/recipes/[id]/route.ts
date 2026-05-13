import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  recipes,
  recipeIngredients,
  recipeSteps,
  recipeNutrition,
  cookingProgress,
  cookLogs,
} from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const recipeId = Number(id);

  const [recipe] = await db
    .select()
    .from(recipes)
    .where(
      and(eq(recipes.id, recipeId), eq(recipes.userId, session.user.id)),
    );

  if (!recipe) {
    return NextResponse.json(
      { error: "레시피를 찾을 수 없습니다" },
      { status: 404 },
    );
  }

  const [ingredients, steps, nutrition, progress, cookCount] = await Promise.all(
    [
      db
        .select()
        .from(recipeIngredients)
        .where(eq(recipeIngredients.recipeId, recipeId))
        .orderBy(recipeIngredients.orderIndex),
      db
        .select()
        .from(recipeSteps)
        .where(eq(recipeSteps.recipeId, recipeId))
        .orderBy(recipeSteps.stepNumber),
      db
        .select()
        .from(recipeNutrition)
        .where(eq(recipeNutrition.recipeId, recipeId))
        .then((rows) => rows[0] ?? null),
      db
        .select()
        .from(cookingProgress)
        .where(eq(cookingProgress.recipeId, recipeId))
        .then((rows) => rows[0] ?? null),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(cookLogs)
        .where(eq(cookLogs.recipeId, recipeId))
        .then((rows) => rows[0]?.count ?? 0),
    ],
  );

  return NextResponse.json({
    ...recipe,
    ingredients,
    steps,
    nutrition,
    cookingProgress: progress,
    cookCount,
  });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const recipeId = Number(id);

  const [existing] = await db
    .select({ id: recipes.id })
    .from(recipes)
    .where(
      and(eq(recipes.id, recipeId), eq(recipes.userId, session.user.id)),
    );

  if (!existing) {
    return NextResponse.json(
      { error: "레시피를 찾을 수 없습니다" },
      { status: 404 },
    );
  }

  const body = await request.json();

  await db
    .update(recipes)
    .set({
      title: body.title,
      description: body.description,
      category: body.category,
      imageUrl: body.images ?? body.image_url ?? null,
      servings: body.servings,
      prepTime: body.prep_time,
      cookTime: body.cook_time,
      updatedAt: new Date(),
    })
    .where(eq(recipes.id, recipeId));

  // 재료: 전체 삭제 후 재삽입
  await db
    .delete(recipeIngredients)
    .where(eq(recipeIngredients.recipeId, recipeId));

  if (body.ingredients?.length) {
    await db.insert(recipeIngredients).values(
      body.ingredients.map(
        (ing: { name: string; amount: string; unit: string }, idx: number) => ({
          recipeId,
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          orderIndex: idx,
        }),
      ),
    );
  }

  // 단계: 전체 삭제 후 재삽입
  await db.delete(recipeSteps).where(eq(recipeSteps.recipeId, recipeId));

  if (body.steps?.length) {
    await db.insert(recipeSteps).values(
      body.steps.map(
        (step: { step_number: number; instruction: string; tip: string; image_url?: string }) => ({
          recipeId,
          stepNumber: step.step_number,
          instruction: step.instruction,
          tip: step.tip || null,
          imageUrl: step.image_url || null,
        }),
      ),
    );
  }

  // 영양 정보: upsert
  if (body.nutrition) {
    await db
      .delete(recipeNutrition)
      .where(eq(recipeNutrition.recipeId, recipeId));

    await db.insert(recipeNutrition).values({
      recipeId,
      calories: body.nutrition.calories,
      carbohydrates: body.nutrition.carbohydrates,
      protein: body.nutrition.protein,
      fat: body.nutrition.fat,
      sodium: body.nutrition.sodium,
    });
  }

  return NextResponse.json({ id: recipeId, title: body.title });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const recipeId = Number(id);

  const [recipe] = await db
    .select({ id: recipes.id })
    .from(recipes)
    .where(
      and(eq(recipes.id, recipeId), eq(recipes.userId, session.user.id)),
    );

  if (!recipe) {
    return NextResponse.json(
      { error: "레시피를 찾을 수 없습니다" },
      { status: 404 },
    );
  }

  await db.delete(recipes).where(eq(recipes.id, recipeId));

  return new NextResponse(null, { status: 204 });
}
