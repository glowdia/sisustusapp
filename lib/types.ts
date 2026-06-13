export type Product = {
  id: string;
  name: string;
  category: string;
  color: string;
  priceText: string;
  dimensionsText: string;
  imageUrl: string;
  productUrl: string;
};

export type PaintColor = {
  id: string;
  code: string;
  name: string;
  hex: string | null;
};

export type MoodboardPageType =
  | "cover"
  | "designer_note"
  | "colors_and_surfaces"
  | "furniture_and_lighting"
  | "textiles_and_decor"
  | "floorplan";

export type MoodboardPage = {
  id: string;
  title: string;
  type: MoodboardPageType;
  fixed: boolean;
};

export type CanvasElementBase = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CanvasProduct = CanvasElementBase & {
  type: "product";
  productId: string;
};

export type CanvasText = CanvasElementBase & {
  type: "text";
  text: string;
  fontSize: number;
  fill: string;
};

export type CanvasImage = CanvasElementBase & {
  type: "image";
  src: string;
  alt: string;
};

export type CanvasColor = CanvasElementBase & {
  type: "color";
  label: string;
  code: string;
  name: string;
  hex: string;
};

export type CanvasElement = CanvasProduct | CanvasText | CanvasImage | CanvasColor;

export type PaintSurface = {
  id: string;
  label: string;
  colorId: string | null;
};
