import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import Papa from "papaparse";

const rootDir = process.cwd();

async function loadLocalEnv() {
  const envPath = path.join(rootDir, ".env.local");

  try {
    const env = await fs.readFile(envPath, "utf8");

    for (const line of env.split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();
      const value = rawValue.replace(/^["']|["']$/g, "");

      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

async function readCsv(fileName) {
  return fs.readFile(path.join(rootDir, fileName), "utf8");
}

function parseCsv(csv, delimiter) {
  const result = Papa.parse(csv.replace(/^\uFEFF/, ""), {
    header: true,
    delimiter,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    throw new Error(result.errors.map((error) => error.message).join(", "));
  }

  return result.data;
}

function chunk(items, size) {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

async function insertInChunks(supabase, table, rows) {
  for (const rowsChunk of chunk(rows, 500)) {
    const { error } = await supabase.from(table).insert(rowsChunk);

    if (error) {
      throw error;
    }
  }
}

async function upsertInChunks(supabase, table, rows, onConflict) {
  for (const rowsChunk of chunk(rows, 500)) {
    const { error } = await supabase.from(table).upsert(rowsChunk, { onConflict });

    if (error) {
      throw error;
    }
  }
}

await loadLocalEnv();

const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const organizationId = requireEnv("SEED_ORGANIZATION_ID");

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const productsCsv = await readCsv("tuotelista-muokattu.csv");
const productRows = parseCsv(productsCsv, ";");
const products = productRows
  .map((row) => ({
    organization_id: organizationId,
    name: row["tuotteen nimi"]?.trim() ?? "",
    category: row.kategoria?.trim() || null,
    color: row["väri"]?.trim() || null,
    price_text: row.hinta?.trim() || null,
    dimensions_text: row.mitat?.trim() || null,
    image_url: row["tuotekuvan url"]?.trim() || null,
    product_url: row["tuotesivun url"]?.trim() || null,
    source: "csv",
    is_active: true,
  }))
  .filter((product) => product.name);

const colorsCsv = await readCsv("tikkurila_tunne_vari_2020.csv");
const colorRows = parseCsv(colorsCsv, ",");
const paintColors = colorRows
  .map((row) => ({
    code: row.Koodi?.trim() ?? "",
    name: row.Nimi?.trim() ?? "",
    hex: row.HEX === "N/A" ? null : row.HEX?.trim() || null,
  }))
  .filter((color) => color.code && color.name);

console.log(`Importing ${products.length} products and ${paintColors.length} paint colors...`);

const deleteExisting = await supabase
  .from("products")
  .delete()
  .eq("organization_id", organizationId)
  .eq("source", "csv");

if (deleteExisting.error) {
  throw deleteExisting.error;
}

await insertInChunks(supabase, "products", products);
await upsertInChunks(supabase, "paint_colors", paintColors, "code,name");

console.log("Catalog import completed.");
