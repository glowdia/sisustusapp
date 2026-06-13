import fs from "node:fs/promises";
import path from "node:path";
import Papa from "papaparse";
import type { PaintColor, Product } from "@/lib/types";

type ProductCsvRow = {
  "tuotteen nimi": string;
  kategoria: string;
  "väri": string;
  hinta: string;
  mitat: string;
  "tuotekuvan url": string;
  "tuotesivun url": string;
};

type PaintCsvRow = {
  Koodi: string;
  Nimi: string;
  HEX: string;
};

async function readCsv(fileName: string) {
  const filePath = path.join(process.cwd(), fileName);
  return fs.readFile(filePath, "utf8");
}

export function parseCsv<T>(csv: string, delimiter: "," | ";") {
  const result = Papa.parse<T>(csv.replace(/^\uFEFF/, ""), {
    header: true,
    delimiter,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    throw new Error(result.errors.map((error) => error.message).join(", "));
  }

  return result.data;
}

export async function getProducts(): Promise<Product[]> {
  const csv = await readCsv("tuotelista-muokattu.csv");
  return parseProductsCsv(csv);
}

export function parseProductsCsv(csv: string): Product[] {
  const rows = parseCsv<ProductCsvRow>(csv, ";");

  return rows.map((row, index) => ({
    id: `product-${index + 1}`,
    name: row["tuotteen nimi"]?.trim() ?? "",
    category: row.kategoria?.trim() ?? "",
    color: row["väri"]?.trim() ?? "",
    priceText: row.hinta?.trim() ?? "",
    dimensionsText: row.mitat?.trim() ?? "",
    imageUrl: row["tuotekuvan url"]?.trim() ?? "",
    productUrl: row["tuotesivun url"]?.trim() ?? "",
  }));
}

export async function getPaintColors(): Promise<PaintColor[]> {
  const csv = await readCsv("tikkurila_tunne_vari_2020.csv");
  return parsePaintColorsCsv(csv);
}

export function parsePaintColorsCsv(csv: string): PaintColor[] {
  const rows = parseCsv<PaintCsvRow>(csv, ",");

  return rows.map((row, index) => ({
    id: `paint-${index + 1}`,
    code: row.Koodi,
    name: row.Nimi,
    hex: row.HEX === "N/A" ? null : row.HEX,
  }));
}
