import { z } from "zod";

const baseElementSchema = z.object({
  id: z.string().min(1),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  rotation: z.number().default(0),
  locked: z.boolean().default(false),
  zIndex: z.number().int().default(1),
});

const textElementSchema = baseElementSchema.extend({
  type: z.literal("text"),
  text: z.string(),
  fontSize: z.number().positive(),
  fontFamily: z.string().default("Inter"),
  fontWeight: z.enum(["normal", "bold"]).default("normal"),
  color: z.string().min(1),
  align: z.enum(["left", "center", "right"]).default("left"),
});

const productElementSchema = baseElementSchema.extend({
  type: z.literal("product"),
  productId: z.string().nullable(),
  snapshot: z.object({
    name: z.string(),
    color: z.string(),
    priceText: z.string(),
    dimensionsText: z.string(),
    imageUrl: z.string().nullable(),
    imageStoragePath: z.string().nullable(),
    productUrl: z.string().nullable(),
  }),
  imageFit: z.literal("contain").default("contain"),
  showProductLink: z.boolean().default(true),
});

const imageElementSchema = baseElementSchema.extend({
  type: z.literal("image"),
  storagePath: z.string().nullable(),
  sourceUrl: z.string().nullable(),
  altText: z.string().default(""),
  fit: z.literal("contain").default("contain"),
});

const colorSwatchElementSchema = baseElementSchema.extend({
  type: z.literal("color_swatch"),
  paintColorId: z.string().nullable(),
  code: z.string(),
  name: z.string(),
  hex: z.string(),
  surfaceLabel: z.string(),
});

const floorplanElementSchema = baseElementSchema.extend({
  type: z.literal("floorplan"),
  originalStoragePath: z.string(),
  previewStoragePath: z.string().nullable(),
  fileType: z.enum(["pdf", "png", "jpg", "jpeg", "webp"]),
});

export const canvasElementV1Schema = z.discriminatedUnion("type", [
  textElementSchema,
  productElementSchema,
  imageElementSchema,
  colorSwatchElementSchema,
  floorplanElementSchema,
]);

export const canvasJsonV1Schema = z.object({
  schemaVersion: z.literal(1),
  canvas: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
    background: z.string().min(1),
  }),
  elements: z.array(canvasElementV1Schema),
});

export type CanvasElementV1 = z.infer<typeof canvasElementV1Schema>;
export type CanvasJsonV1 = z.infer<typeof canvasJsonV1Schema>;

export function parseCanvasJsonV1(value: unknown): CanvasJsonV1 {
  return canvasJsonV1Schema.parse(value);
}
