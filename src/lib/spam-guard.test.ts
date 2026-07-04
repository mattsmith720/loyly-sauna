import { describe, expect, it } from "vitest";
import { HONEYPOT_FIELD, isHoneypotTripped } from "./spam-guard";

describe("isHoneypotTripped", () => {
  it("returns false for empty honeypot", () => {
    expect(isHoneypotTripped({ [HONEYPOT_FIELD]: "" })).toBe(false);
  });

  it("returns false when honeypot field is missing", () => {
    expect(isHoneypotTripped({ name: "Matt" })).toBe(false);
  });

  it("returns true when honeypot has content", () => {
    expect(isHoneypotTripped({ [HONEYPOT_FIELD]: "https://spam.example" })).toBe(true);
  });

  it("returns false for invalid body", () => {
    expect(isHoneypotTripped(null)).toBe(false);
  });
});
