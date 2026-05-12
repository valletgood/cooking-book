import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { recipes, cookingProgress } from "@/db/schema";
import { eq, and } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
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

  const body = await request.json();
  const { current_step } = body as { current_step: number | null };

  if (current_step === null) {
    await db
      .delete(cookingProgress)
      .where(eq(cookingProgress.recipeId, recipeId));

    return NextResponse.json({
      recipeId,
      currentStep: null,
      updatedAt: new Date().toISOString(),
    });
  }

  if (typeof current_step !== "number" || current_step < 1) {
    return NextResponse.json(
      { error: "current_step은 1 이상의 숫자여야 합니다" },
      { status: 400 },
    );
  }

  const [existing] = await db
    .select()
    .from(cookingProgress)
    .where(eq(cookingProgress.recipeId, recipeId));

  if (existing) {
    const [updated] = await db
      .update(cookingProgress)
      .set({ currentStep: current_step, updatedAt: new Date() })
      .where(eq(cookingProgress.recipeId, recipeId))
      .returning();

    return NextResponse.json({
      recipeId,
      currentStep: updated.currentStep,
      updatedAt: updated.updatedAt,
    });
  }

  const [created] = await db
    .insert(cookingProgress)
    .values({ recipeId, currentStep: current_step })
    .returning();

  return NextResponse.json({
    recipeId,
    currentStep: created.currentStep,
    updatedAt: created.updatedAt,
  });
}
