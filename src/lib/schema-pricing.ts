export function parsePriceRange(price: string): {
  minPrice?: string;
  maxPrice?: string;
  unitText?: string;
} {
  if (price.startsWith("~")) {
    const value = price.replace(/[^\d]/g, "");
    return { minPrice: value, maxPrice: value, unitText: "MONTH" };
  }

  if (price.includes("-")) {
    const [min, max] = price
      .replace(/\$/g, "")
      .split("-")
      .map((part) => part.replace(/[^\d.k+]/gi, "").replace("k", "000"));
    return { minPrice: min, maxPrice: max.replace("+", ""), unitText: "MONTH" };
  }

  if (price.includes("+")) {
    const min = price.replace(/\$/g, "").replace(/k/gi, "000").replace(/[^\d]/g, "");
    return { minPrice: min, unitText: "MONTH" };
  }

  return {};
}
