import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { recipes } from "@/db/schema";
import { eq, and, not } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const recipeId = Number(id);

  const [recipe] = await db
    .select({ id: recipes.id, isFavorite: recipes.isFavorite })
    .from(recipes)
    .where(and(eq(recipes.id, recipeId), eq(recipes.userId, session.user.id)));

  if (!recipe) {
    return NextResponse.json({ error: "레시피를 찾을 수 없습니다" }, { status: 404 });
  }

  const [updated] = await db
    .update(recipes)
    .set({ isFavorite: not(recipes.isFavorite) })
    .where(eq(recipes.id, recipeId))
    .returning({ isFavorite: recipes.isFavorite });

  return NextResponse.json({ isFavorite: updated.isFavorite });
}
