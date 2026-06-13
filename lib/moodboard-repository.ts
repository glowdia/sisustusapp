import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { CanvasElement, MoodboardPage, MoodboardPageType, PaintSurface } from "@/lib/types";

type MoodboardPageRow = Database["public"]["Tables"]["moodboard_pages"]["Row"];

const pageTypes = new Set<MoodboardPageType>([
  "cover",
  "designer_note",
  "colors_and_surfaces",
  "furniture_and_lighting",
  "textiles_and_decor",
  "floorplan",
]);

export function mapMoodboardPageRow(row: MoodboardPageRow): MoodboardPage {
  const type = pageTypes.has(row.page_type as MoodboardPageType)
    ? (row.page_type as MoodboardPageType)
    : "furniture_and_lighting";

  return {
    fixed: row.fixed,
    id: row.id,
    title: row.title,
    type,
  };
}

function mapPageElements(row: MoodboardPageRow): CanvasElement[] {
  if (!row.canvas_json || typeof row.canvas_json !== "object" || Array.isArray(row.canvas_json)) {
    return [];
  }

  const elements = row.canvas_json.elements;
  return Array.isArray(elements) ? (elements as CanvasElement[]) : [];
}

function mapSurfaceSelections(row: MoodboardPageRow): PaintSurface[] | null {
  if (!row.canvas_json || typeof row.canvas_json !== "object" || Array.isArray(row.canvas_json)) {
    return null;
  }

  const surfaceSelections = row.canvas_json.surfaceSelections;
  return Array.isArray(surfaceSelections) ? (surfaceSelections as PaintSurface[]) : null;
}

export async function getProjectMoodboard(
  supabase: SupabaseClient<Database>,
  projectId: string,
) {
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, name, client_name, room_name")
    .eq("id", projectId)
    .maybeSingle();

  if (projectError) {
    throw projectError;
  }

  if (!project) {
    return null;
  }

  const { data: moodboard, error: moodboardError } = await supabase
    .from("moodboards")
    .select("id, title")
    .eq("project_id", projectId)
    .maybeSingle();

  if (moodboardError) {
    throw moodboardError;
  }

  if (!moodboard) {
    return null;
  }

  const { data: pageRows, error: pagesError } = await supabase
    .from("moodboard_pages")
    .select("*")
    .eq("moodboard_id", moodboard.id)
    .order("sort_order", { ascending: true });

  if (pagesError) {
    throw pagesError;
  }

  return {
    moodboard,
    pageElements: Object.fromEntries((pageRows ?? []).map((row) => [row.id, mapPageElements(row)])),
    pageIds: (pageRows ?? []).map((row) => row.id),
    pages: (pageRows ?? []).map(mapMoodboardPageRow),
    project,
    surfaceSelections: (pageRows ?? []).map(mapSurfaceSelections).find(Boolean) ?? null,
  };
}
