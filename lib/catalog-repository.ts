import type { SupabaseClient } from "@supabase/supabase-js";
import type { PaintColor, Product } from "@/lib/types";
import type { Database } from "@/lib/supabase/database.types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type PaintColorRow = Database["public"]["Tables"]["paint_colors"]["Row"];

export function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category ?? "",
    color: row.color ?? "",
    priceText: row.price_text ?? "",
    dimensionsText: row.dimensions_text ?? "",
    imageUrl: row.image_storage_path ?? row.image_url ?? "",
    productUrl: row.product_url ?? "",
  };
}

export function mapPaintColorRow(row: PaintColorRow): PaintColor {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    hex: row.hex,
  };
}

export async function getProductsForOrganization(
  supabase: SupabaseClient<Database>,
  organizationId: string,
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapProductRow);
}

export async function getPaintColorsFromDatabase(
  supabase: SupabaseClient<Database>,
): Promise<PaintColor[]> {
  const { data, error } = await supabase
    .from("paint_colors")
    .select("*")
    .order("code", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapPaintColorRow);
}
