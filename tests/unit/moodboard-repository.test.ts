import { describe, expect, it } from "vitest";
import { mapMoodboardPageRow } from "@/lib/moodboard-repository";

describe("moodboard repository mappers", () => {
  it("maps Supabase page rows to editor page objects", () => {
    expect(
      mapMoodboardPageRow({
        canvas_json: {
          schemaVersion: 1,
          canvas: { width: 1190, height: 842, background: "#f7f3ed" },
          elements: [],
        },
        created_at: "2026-06-13T00:00:00.000Z",
        fixed: false,
        id: "page-id",
        moodboard_id: "moodboard-id",
        page_type: "furniture_and_lighting",
        schema_version: 1,
        sort_order: 4,
        title: "Huonekalut ja valaisimet",
        updated_at: "2026-06-13T00:00:00.000Z",
        version: 1,
      }),
    ).toEqual({
      fixed: false,
      id: "page-id",
      title: "Huonekalut ja valaisimet",
      type: "furniture_and_lighting",
    });
  });

  it("falls back to a product page type for unknown page types", () => {
    expect(
      mapMoodboardPageRow({
        canvas_json: {},
        created_at: "2026-06-13T00:00:00.000Z",
        fixed: false,
        id: "page-id",
        moodboard_id: "moodboard-id",
        page_type: "unexpected",
        schema_version: 1,
        sort_order: 1,
        title: "Custom",
        updated_at: "2026-06-13T00:00:00.000Z",
        version: 1,
      }).type,
    ).toBe("furniture_and_lighting");
  });
});
