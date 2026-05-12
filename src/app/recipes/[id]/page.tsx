import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/db";
import {
  recipes,
  recipeIngredients,
  recipeSteps,
  recipeNutrition,
  cookingProgress,
  cookLogs,
} from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { RecipeDetail } from "./RecipeDetail";

interface RecipePageProps {
  params: Promise<{ id: string }>;
}

export default async function RecipePage({ params }: RecipePageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;
  const recipeId = Number(id);

  const [recipe] = await db
    .select()
    .from(recipes)
    .where(and(eq(recipes.id, recipeId), eq(recipes.userId, session.user.id!)));

  if (!recipe) {
    notFound();
  }

  const [ingredients, steps, nutrition, progress, cookCount, logs] =
    await Promise.all([
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
      db
        .select()
        .from(cookLogs)
        .where(eq(cookLogs.recipeId, recipeId))
        .orderBy(desc(cookLogs.cookedAt)),
    ]);

  return (
    <RecipeDetail
      recipe={recipe}
      ingredients={ingredients}
      steps={steps}
      nutrition={nutrition}
      cookingProgress={progress}
      cookCount={cookCount}
      cookLogs={logs}
    />
  );
}
