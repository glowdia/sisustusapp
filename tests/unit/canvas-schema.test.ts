import { describe, expect, it } from "vitest";
import { parseCanvasJsonV1 } from "@/lib/canvas-schema";

describe("canvas_json v1 schema", () => {
  it("accepts a valid product element snapshot", () => {
    const parsed = parseCanvasJsonV1({
      schemaVersion: 1,
      canvas: {
        width: 1190,
        height: 842,
        background: "#f7f3ed",
      },
      elements: [
        {
          id: "element-1",
          type: "product",
          productId: "product-1",
          x: 100,
          y: 120,
          width: 260,
          height: 360,
          snapshot: {
            name: "Sohva",
            color: "Konjakki",
            priceText: "599,00 €",
            dimensionsText: "Leveys 197 cm",
            imageUrl: "https://example.com/sofa.jpg",
            imageStoragePath: null,
            productUrl: "https://example.com/sofa",
          },
        },
      ],
    });

    expect(parsed.elements[0]).toMatchObject({
      type: "product",
      imageFit: "contain",
      showProductLink: true,
    });
  });

  it("rejects unknown element types", () => {
    expect(() =>
      parseCanvasJsonV1({
        schemaVersion: 1,
        canvas: {
          width: 1190,
          height: 842,
          background: "#f7f3ed",
        },
        elements: [
          {
            id: "element-1",
            type: "unknown",
            x: 0,
            y: 0,
            width: 100,
            height: 100,
          },
        ],
      }),
    ).toThrow();
  });
});
