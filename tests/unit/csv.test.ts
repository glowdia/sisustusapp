import { describe, expect, it } from "vitest";
import { parsePaintColorsCsv, parseProductsCsv } from "@/lib/csv";

describe("CSV parsing", () => {
  it("parses product rows from the current semicolon-delimited feed", () => {
    const csv = [
      "tuotteen nimi;kategoria;väri;hinta;mitat;tuotekuvan url;tuotesivun url",
      " Sohva ;Huonekalut;Konjakki;599,00 €;Leveys 197 cm;https://example.com/sofa.jpg;https://example.com/sofa",
    ].join("\n");

    expect(parseProductsCsv(csv)).toEqual([
      {
        id: "product-1",
        name: "Sohva",
        category: "Huonekalut",
        color: "Konjakki",
        priceText: "599,00 €",
        dimensionsText: "Leveys 197 cm",
        imageUrl: "https://example.com/sofa.jpg",
        productUrl: "https://example.com/sofa",
      },
    ]);
  });

  it("parses Tikkurila colors and converts N/A hex values to null", () => {
    const csv = ["Koodi,Nimi,HEX", "G487,Höyhen,#d9d2c3", "X000,Puuttuva,N/A"].join("\n");

    expect(parsePaintColorsCsv(csv)).toEqual([
      {
        id: "paint-1",
        code: "G487",
        name: "Höyhen",
        hex: "#d9d2c3",
      },
      {
        id: "paint-2",
        code: "X000",
        name: "Puuttuva",
        hex: null,
      },
    ]);
  });
});
