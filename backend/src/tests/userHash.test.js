import { describe, test, expect } from "vitest";
import argon2 from "argon2";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("Sécurité - Hash du mot de passe", () => {
  test("le mot de passe est bien hashé avec Argon2 et valide", async () => {
    const user = await prisma.user.findUnique({
      where: { email: "user@pokebuild.com" },
    });

    expect(user).toBeDefined();
    expect(user.passwordHash).toBeDefined();

    expect(user.passwordHash).not.toBe("User123!");

    expect(user.passwordHash.startsWith("$argon2")).toBe(true);

    const isValid = await argon2.verify(user.passwordHash, "User123!");
    expect(isValid).toBe(true);
  });

  test("le mot de passe admin est aussi hashé avec Argon2", async () => {
    const admin = await prisma.user.findUnique({
      where: { email: "admin@pokebuild.com" },
    });

    expect(admin).toBeDefined();
    expect(admin.passwordHash.startsWith("$argon2")).toBe(true);
  });
});