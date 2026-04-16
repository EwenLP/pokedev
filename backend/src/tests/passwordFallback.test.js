import { describe, test, expect } from "vitest";

const { tryVerifyPassword } = require("../controllers/auth.controller.js");

describe("Password fallback behaviour", () => {
  test("Le système ne devrait pas accepter un mot de passe non hashé", async () => {
    const result = await tryVerifyPassword("User123!", "User123!");

    expect(result.isValid).toBe(false);
  });
});