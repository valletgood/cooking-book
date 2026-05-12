import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RecipeAddForm } from "./RecipeAddForm";

export default async function NewRecipePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return <RecipeAddForm />;
}
