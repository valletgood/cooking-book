import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { SearchBar } from "@/components/recipe/SearchBar";
import { RecipeList } from "@/components/recipe/RecipeList";
import { RecipeListLoading } from "@/components/recipe/RecipeListLoading";

interface HomeProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { q } = await searchParams;

  return (
    <div className="flex min-h-full flex-col bg-cottage-bg">
      <header className="sticky top-0 z-10 bg-cottage-bg/95 px-4 pb-3 pt-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/images/coco_logo.png"
              alt="코코"
              width={32}
              height={32}
              className="h-auto"
            />
            <h1 className="font-heading text-xl font-extrabold text-cottage-text">
              내 레시피
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {session.user.image && (
              <img
                src={session.user.image}
                alt=""
                className="h-8 w-8 rounded-full ring-2 ring-cottage-border"
              />
            )}
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="text-sm text-cottage-text-muted active:text-cottage-text-sub"
              >
                로그아웃
              </button>
            </form>
          </div>
        </div>

        <div className="mt-3">
          <Suspense>
            <SearchBar />
          </Suspense>
        </div>
      </header>

      <main className="flex-1 px-4 pb-24 pt-2">
        <Suspense fallback={<RecipeListLoading />}>
          <RecipeList userId={session.user.id!} q={q} />
        </Suspense>
      </main>

      <Link
        href="/recipes/new"
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-cottage-text text-2xl font-bold text-cottage-bg shadow-lg shadow-cottage-text/40 transition-transform active:scale-90"
      >
        +
      </Link>
    </div>
  );
}
