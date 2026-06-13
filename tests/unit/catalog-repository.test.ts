import { describe, expect, it } from "vitest";
import { mapPaintColorRow, mapProductRow } from "@/lib/catalog-repository";

describe("catalog repository mappers", () => {
  it("maps Supabase product rows to editor products", () => {
    expect(
      mapProductRow({
        category: "Huonekalut",
        color: "Konjakinruskea",
        created_at: "2026-06-12T00:00:00.000Z",
        created_by: null,
        dimensions_text: "Leveys 197 cm",
        id: "product-id",
        image_storage_path: null,
        image_url: "https://example.com/sofa.jpg",
        is_active: true,
        name: "Sohva",
        organization_id: "org-id",
        price_text: "599,00 €",
        product_url: "https://example.com/sofa",
        source: "csv",
        updated_at: "2026-06-12T00:00:00.000Z",
      }),
    ).toEqual({
      id: "product-id",
      name: "Sohva",
      category: "Huonekalut",
      color: "Konjakinruskea",
      priceText: "599,00 €",
      dimensionsText: "Leveys 197 cm",
      imageUrl: "https://example.com/sofa.jpg",
      productUrl: "https://example.com/sofa",
    });
  });

  it("prefers stored product images over remote URLs", () => {
    const product = mapProductRow({
      category: null,
      color: null,
      created_at: "2026-06-12T00:00:00.000Z",
      created_by: null,
      dimensions_text: null,
      id: "product-id",
      image_storage_path: "product-images/org/product.png",
      image_url: "https://example.com/remote.png",
      is_active: true,
      name: "Tuote",
      organization_id: "org-id",
      price_text: null,
      product_url: null,
      source: "manual",
      updated_at: "2026-06-12T00:00:00.000Z",
    });

    expect(product.imageUrl).toBe("product-images/org/product.png");
  });

  it("maps Supabase paint color rows to editor paint colors", () => {
    expect(
      mapPaintColorRow({
        code: "G487",
        created_at: "2026-06-12T00:00:00.000Z",
        hex: "#d9d2c3",
        id: "paint-id",
        name: "Höyhen",
      }),
    ).toEqual({
      id: "paint-id",
      code: "G487",
      name: "Höyhen",
      hex: "#d9d2c3",
    });
  });
});
