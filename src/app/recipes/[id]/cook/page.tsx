import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/db";
import {
  recipes,
  recipeSteps,
  recipeIngredients,
  cookingProgress,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { CookMode } from "./CookMode";

interface CookPageProps {
  params: Promise<{ id: string }>;
}

export default async function CookPage({ params }: CookPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;
  const recipeId = Number(id);

  const [recipe] = await db
    .select({ id: recipes.id, title: recipes.title })
    .from(recipes)
    .where(and(eq(recipes.id, recipeId), eq(recipes.userId, session.user.id!)));

  if (!recipe) {
    notFound();
  }

  const [steps, ingredients, progress] = await Promise.all([
    db
      .select()
      .from(recipeSteps)
      .where(eq(recipeSteps.recipeId, recipeId))
      .orderBy(recipeSteps.stepNumber),
    db
      .select()
      .from(recipeIngredients)
      .where(eq(recipeIngredients.recipeId, recipeId))
      .orderBy(recipeIngredients.orderIndex),
    db
      .select()
      .from(cookingProgress)
      .where(eq(cookingProgress.recipeId, recipeId))
      .then((rows) => rows[0] ?? null),
  ]);

  if (steps.length === 0) {
    redirect(`/recipes/${recipeId}`);
  }

  return (
    <CookMode
      recipeId={recipe.id}
      recipeTitle={recipe.title}
      steps={steps}
      ingredients={ingredients}
      initialStep={progress?.currentStep ?? 1}
    />
  );
}
