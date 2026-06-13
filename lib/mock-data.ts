import type { MoodboardPage } from "@/lib/types";

export const moodboardPages: MoodboardPage[] = [
  {
    id: "cover",
    title: "Otsikkosivu",
    type: "cover",
    fixed: true,
  },
  {
    id: "designer-note",
    title: "Suunnittelijan terveiset",
    type: "designer_note",
    fixed: true,
  },
  {
    id: "colors",
    title: "Värit ja pinnat",
    type: "colors_and_surfaces",
    fixed: true,
  },
  {
    id: "furniture-1",
    title: "Huonekalut ja valaisimet",
    type: "furniture_and_lighting",
    fixed: false,
  },
  {
    id: "decor-1",
    title: "Tekstiilit ja somisteet",
    type: "textiles_and_decor",
    fixed: false,
  },
  {
    id: "floorplan",
    title: "Pohjakuva",
    type: "floorplan",
    fixed: true,
  },
];
