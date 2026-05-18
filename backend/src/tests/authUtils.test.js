import { describe, test, expect } from "vitest";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET = "test_secret";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+\-_.])[A-Za-z\d@$!%*?&#+\-_.]{8,}$/;

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// ─── Email ────────────────────────────────────────────────
describe("Validation email", () => {
  test("email valide", () => expect(EMAIL_REGEX.test("trainer@pokemon.com")).toBe(true));
  test("email sans @", () => expect(EMAIL_REGEX.test("trainerpokemon.com")).toBe(false));
  test("email sans domaine", () => expect(EMAIL_REGEX.test("trainer@")).toBe(false));
  test("email vide", () => expect(EMAIL_REGEX.test("")).toBe(false));
});

// ─── Password ─────────────────────────────────────────────
describe("Validation password", () => {
  test("password valide", () => expect(PASSWORD_REGEX.test("Sacha123!")).toBe(true));
  test("sans majuscule", () => expect(PASSWORD_REGEX.test("sacha123!")).toBe(false));
  test("sans chiffre", () => expect(PASSWORD_REGEX.test("SachaABC!")).toBe(false));
  test("sans caractère spécial", () => expect(PASSWORD_REGEX.test("Sacha1234")).toBe(false));
  test("trop court", () => expect(PASSWORD_REGEX.test("Sa1!")).toBe(false));
});

// ─── JWT ──────────────────────────────────────────────────
describe("JWT - generateToken", () => {
  const fakeUser = { id: 1, email: "sacha@pokemon.com", username: "Sacha", role: "USER" };

  test("génère un token au format JWT (3 parties)", () => {
    const token = generateToken(fakeUser);
    expect(token.split(".")).toHaveLength(3);
  });
  test("le token contient les bonnes données", () => {
    const token = generateToken(fakeUser);
    const decoded = jwt.verify(token, "test_secret");
    expect(decoded.id).toBe(1);
    expect(decoded.role).toBe("USER");
  });
  test("un token falsifié est rejeté", () => {
    expect(() => jwt.verify("faux.token.invalide", "test_secret")).toThrow();
  });
  test("un token signé avec un mauvais secret est rejeté", () => {
    const tokenMalSigne = jwt.sign({ id: 1 }, "mauvais_secret");
    expect(() => jwt.verify(tokenMalSigne, "test_secret")).toThrow();
  });
});