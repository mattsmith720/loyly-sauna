import { describe, expect, it } from "vitest";
import { isValidAuPhone, normalizePhoneInput } from "./phone";

describe("isValidAuPhone", () => {
  it("accepts spaced mobile numbers", () => {
    expect(isValidAuPhone("0407 733 940")).toBe(true);
  });

  it("accepts international mobile format", () => {
    expect(isValidAuPhone("+61407733940")).toBe(true);
  });

  it("accepts landline numbers", () => {
    expect(isValidAuPhone("07 3123 4567")).toBe(true);
  });

  it("rejects too-short numbers", () => {
    expect(isValidAuPhone("123")).toBe(false);
  });

  it("rejects invalid area codes", () => {
    expect(isValidAuPhone("0100000000")).toBe(false);
  });
});

describe("normalizePhoneInput", () => {
  it("removes spaces and punctuation", () => {
    expect(normalizePhoneInput("0407 733 940")).toBe("0407733940");
    expect(normalizePhoneInput("(07) 3123-4567")).toBe("0731234567");
  });
});
