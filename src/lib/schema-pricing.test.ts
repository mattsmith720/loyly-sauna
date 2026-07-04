import { describe, expect, it } from "vitest";
import { parsePriceRange } from "./schema-pricing";

describe("parsePriceRange", () => {
  it("parses approximate monthly prices", () => {
    expect(parsePriceRange("~$700")).toEqual({
      minPrice: "700",
      maxPrice: "700",
      unitText: "MONTH",
    });
  });

  it("parses ranged monthly prices with k shorthand", () => {
    expect(parsePriceRange("$700-$1k")).toEqual({
      minPrice: "700",
      maxPrice: "1000",
      unitText: "MONTH",
    });
  });

  it("parses open-ended monthly prices", () => {
    expect(parsePriceRange("$1k+")).toEqual({
      minPrice: "1000",
      unitText: "MONTH",
    });
  });

  it("returns empty object for unknown formats", () => {
    expect(parsePriceRange("Custom quote")).toEqual({});
  });
});
