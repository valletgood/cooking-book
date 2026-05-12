import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { recipes, cookLogs, cookingProgress } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
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

  const body = await request.json().catch(() => ({}));
  const { memo } = body as { memo?: string };

  const [log] = await db
    .insert(cookLogs)
    .values({
      recipeId,
      memo: memo?.trim() || null,
    })
    .returning();

  await db
    .delete(cookingProgress)
    .where(eq(cookingProgress.recipeId, recipeId));

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(cookLogs)
    .where(eq(cookLogs.recipeId, recipeId));

  return NextResponse.json(
    {
      id: log.id,
      recipeId,
      cookCount: countResult?.count ?? 1,
      cookedAt: log.cookedAt,
    },
    { status: 201 },
  );
}
