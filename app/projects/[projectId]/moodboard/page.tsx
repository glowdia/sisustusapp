import Link from "next/link";
import { redirect } from "next/navigation";
import { EditorShellClient } from "@/components/editor-shell-client";
import { getProducts, getPaintColors } from "@/lib/csv";
import { createClient } from "@/lib/supabase/server";
import { getProjectMoodboard } from "@/lib/moodboard-repository";

type ProjectMoodboardPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ProjectMoodboardPage({ params }: ProjectMoodboardPageProps) {
  const { projectId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [catalog, moodboardData] = await Promise.all([
    Promise.all([getProducts(), getPaintColors()]),
    getProjectMoodboard(supabase, projectId),
  ]);
  const [products, paintColors] = catalog;

  if (!moodboardData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f3ed] px-5">
        <section className="max-w-md rounded-lg border border-stone-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-stone-950">Projektia ei löytynyt</h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Projektia ei ole olemassa tai käyttäjällä ei ole siihen käyttöoikeutta.
          </p>
          <Link className="mt-6 inline-flex rounded-md bg-stone-950 px-4 py-2 text-sm font-semibold text-white" href="/projects">
            Takaisin projekteihin
          </Link>
        </section>
      </main>
    );
  }

  if (moodboardData.pages.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f3ed] px-5">
        <section className="max-w-md rounded-lg border border-stone-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-stone-950">Moodboard-sivuja ei löytynyt</h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Projektille ei ole vielä luotu sivurakennetta.
          </p>
          <Link className="mt-6 inline-flex rounded-md bg-stone-950 px-4 py-2 text-sm font-semibold text-white" href="/projects">
            Takaisin projekteihin
          </Link>
        </section>
      </main>
    );
  }

  return (
    <EditorShellClient
      initialPageElements={moodboardData.pageElements}
      initialSurfaceSelections={moodboardData.surfaceSelections}
      pages={moodboardData.pages}
      paintColors={paintColors}
      products={products}
      project={{
        backHref: "/projects",
        clientName: moodboardData.project.client_name,
        moodboardId: moodboardData.moodboard.id,
        pageIds: moodboardData.pageIds,
        roomName: moodboardData.project.room_name,
        storageKey: `sisustusapp-project-${projectId}`,
        title: moodboardData.project.name,
      }}
    />
  );
}
