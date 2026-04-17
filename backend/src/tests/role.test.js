import { describe, test, expect } from "vitest";

const ROLES = ["USER", "ADMIN"];

const isValidRole = (role) => ROLES.includes(role);

const canAccessAdmin = (role) => role === "ADMIN";

describe("Validation des rôles", () => {
  test("rôle USER est valide", () => expect(isValidRole("USER")).toBe(true));
  test("rôle ADMIN est valide", () => expect(isValidRole("ADMIN")).toBe(true));
  test("rôle inconnu est invalide", () => expect(isValidRole("SUPERADMIN")).toBe(false));
  test("rôle vide est invalide", () => expect(isValidRole("")).toBe(false));

  test("ADMIN peut accéder à l'administration", () => expect(canAccessAdmin("ADMIN")).toBe(true));
  test("USER ne peut pas accéder à l'administration", () => expect(canAccessAdmin("USER")).toBe(false));
});