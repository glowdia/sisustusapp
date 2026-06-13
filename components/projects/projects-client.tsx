"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { createClient } from "@/lib/supabase/browser";

type Profile = {
  default_organization_id: string | null;
  full_name: string | null;
};

type Project = {
  client_name: string | null;
  id: string;
  name: string;
  room_name: string | null;
  status: string;
  updated_at: string;
};

export function ProjectsClient() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadProjects() {
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.push("/login");
      router.refresh();
      return;
    }

    setEmail(user.email ?? null);

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, default_organization_id")
      .eq("id", user.id)
      .single();

    if (profileError) {
      setError("Käyttäjäprofiilia ei löytynyt. Tarkista Supabase-profiili ja organisaatiojäsenyys.");
      setIsLoading(false);
      return;
    }

    setProfile(profileData);

    const { data: projectData, error: projectsError } = await supabase
      .from("projects")
      .select("id, name, client_name, room_name, status, updated_at")
      .order("updated_at", { ascending: false });

    if (projectsError) {
      setError("Projektien lataus epäonnistui.");
      setIsLoading(false);
      return;
    }

    setProjects(projectData ?? []);
    setIsLoading(false);
  }

  async function createProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError(null);
    setIsCreating(true);

    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const clientName = String(formData.get("clientName") ?? "").trim();
    const roomName = String(formData.get("roomName") ?? "").trim();

    if (!name) {
      setError("Projektin nimi puuttuu.");
      setIsCreating(false);
      return;
    }

    if (!profile?.default_organization_id) {
      setError("Käyttäjällä ei ole organisaatiota.");
      setIsCreating(false);
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      router.refresh();
      return;
    }

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        client_name: clientName || null,
        designer_name: profile.full_name,
        name,
        organization_id: profile.default_organization_id,
        owner_id: user.id,
        room_name: roomName || null,
      })
      .select("id")
      .single();

    if (projectError) {
      setError("Projektin luonti epäonnistui.");
      setIsCreating(false);
      return;
    }

    const { data: moodboard, error: moodboardError } = await supabase
      .from("moodboards")
      .insert({
        project_id: project.id,
        title: name,
      })
      .select("id")
      .single();

    if (moodboardError) {
      setError("Moodboardin luonti epäonnistui.");
      setIsCreating(false);
      return;
    }

    const defaultPages = [
      ["cover", "Otsikkosivu", true],
      ["designer_note", "Suunnittelijan terveiset", true],
      ["colors_and_surfaces", "Värit ja pinnat", true],
      ["furniture_and_lighting", "Huonekalut ja valaisimet", false],
      ["textiles_and_decor", "Tekstiilit ja somisteet", false],
      ["floorplan", "Pohjakuva", true],
    ] as const;

    const { error: pagesError } = await supabase.from("moodboard_pages").insert(
      defaultPages.map(([pageType, title, fixed], index) => ({
        fixed,
        moodboard_id: moodboard.id,
        page_type: pageType,
        sort_order: index + 1,
        title,
      })),
    );

    if (pagesError) {
      setError("Moodboard-sivujen luonti epäonnistui.");
      setIsCreating(false);
      return;
    }

    form.reset();
    router.push(`/projects/${project.id}/moodboard`);
    setIsCreating(false);
  }

  async function deleteProject(project: Project) {
    const confirmed = window.confirm(`Poistetaanko projekti "${project.name}"? Tätä ei voi perua.`);

    if (!confirmed) {
      return;
    }

    setError(null);
    setDeletingProjectId(project.id);

    const supabase = createClient();
    const { error: deleteError } = await supabase.from("projects").delete().eq("id", project.id);

    if (deleteError) {
      setError("Projektin poisto epäonnistui.");
      setDeletingProjectId(null);
      return;
    }

    setProjects((current) => current.filter((item) => item.id !== project.id));
    setDeletingProjectId(null);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f7f3ed]">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-stone-500">
              Sisustusapp
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-stone-950">Projektit</h1>
          </div>
          <SignOutButton />
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[360px_1fr]">
        <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-950">Uusi projekti</h2>
          <p className="mt-1 text-sm leading-6 text-stone-600">
            Projekti tallentuu Supabaseen kirjautuneelle käyttäjälle.
          </p>

          {profile?.default_organization_id ? (
            <form className="mt-5 space-y-4" onSubmit={createProject}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-800" htmlFor="name">
                  Projektin nimi
                </label>
                <input
                  className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-950 outline-none transition focus:border-stone-700"
                  id="name"
                  name="name"
                  required
                  placeholder="Testiolohuone"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-800" htmlFor="clientName">
                  Asiakas
                </label>
                <input
                  className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-950 outline-none transition focus:border-stone-700"
                  id="clientName"
                  name="clientName"
                  placeholder="Teppo Testiasiakas"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-800" htmlFor="roomName">
                  Tila
                </label>
                <input
                  className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-950 outline-none transition focus:border-stone-700"
                  id="roomName"
                  name="roomName"
                  placeholder="Olohuone"
                />
              </div>

              {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isCreating}
                type="submit"
              >
                <Plus aria-hidden="true" size={16} />
                {isCreating ? "Luodaan..." : "Luo projekti"}
              </button>
            </form>
          ) : (
            <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              {isLoading
                ? "Ladataan käyttäjätietoja..."
                : "Käyttäjäprofiililta puuttuu organisaatio. Tarkista Supabasen profiles ja organization_members -taulut."}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-stone-950">Omat projektit</h2>
              <p className="mt-1 text-sm text-stone-600">
                Kirjautunut käyttäjä: {profile?.full_name ?? email ?? "Ladataan..."}
              </p>
            </div>
            <Link
              className="rounded-md border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500 hover:text-stone-950"
              href="/demo"
            >
              Avaa demo
            </Link>
          </div>

          {isLoading ? (
            <div className="mt-5 rounded-md border border-stone-200 bg-stone-50 p-8 text-center text-sm text-stone-600">
              Ladataan projekteja...
            </div>
          ) : projects.length > 0 ? (
            <div className="mt-5 divide-y divide-stone-200">
              {projects.map((project) => (
                <article className="py-4" key={project.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-stone-950">{project.name}</h3>
                      <p className="mt-1 text-sm text-stone-600">
                        {[project.client_name, project.room_name].filter(Boolean).join(" · ") ||
                          "Ei asiakas- tai tilatietoa"}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link
                          className="inline-flex rounded-md border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500 hover:text-stone-950"
                          href={`/projects/${project.id}/moodboard`}
                        >
                          Avaa moodboard
                        </Link>
                        <button
                          className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:border-red-400 hover:text-red-900 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={deletingProjectId === project.id}
                          onClick={() => void deleteProject(project)}
                          type="button"
                        >
                          <Trash2 aria-hidden="true" size={15} />
                          {deletingProjectId === project.id ? "Poistetaan..." : "Poista"}
                        </button>
                      </div>
                    </div>
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                      {project.status}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-md border border-dashed border-stone-300 p-8 text-center">
              <p className="font-medium text-stone-900">Ei projekteja vielä</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Luo ensimmäinen projekti vasemman reunan lomakkeella.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
