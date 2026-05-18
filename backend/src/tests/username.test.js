import { describe, test, expect } from "vitest";

const isValidUsername = (username) => {
  if (typeof username !== "string") return false;
  const trimmed = username.trim();
  return trimmed.length >= 3 && trimmed.length <= 50;
};

describe("Validation username", () => {
  test("username valide", () => expect(isValidUsername("Sacha")).toBe(true));
  test("username trop court (moins de 3 caractères)", () => expect(isValidUsername("ab")).toBe(false));
  test("username trop long (plus de 50 caractères)", () => expect(isValidUsername("a".repeat(51))).toBe(false));
  test("username vide", () => expect(isValidUsername("")).toBe(false));
  test("username avec espaces seulement", () => expect(isValidUsername("   ")).toBe(false));
});