require("dotenv").config();

const argon2 = require("argon2");
const prisma = require("../config/prisma");

const argonOptions = {
  type: argon2.argon2id,
  timeCost: 3,
  memoryCost: 65536,
  parallelism: 1,
};

async function createUser() {
  const [, , email, username, password, roleArg] = process.argv;
  const role = (roleArg || "USER").toUpperCase();

  if (!email || !username || !password) {
    console.error("Usage: node src/scripts/createUser.js <email> <username> <password> [USER|ADMIN]");
    process.exit(1);
  }

  if (!["USER", "ADMIN"].includes(role)) {
    console.error("Le rôle doit être USER ou ADMIN.");
    process.exit(1);
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existingUser) {
    console.error("Un utilisateur avec cet email ou ce username existe déjà.");
    process.exit(1);
  }

  const passwordHash = await argon2.hash(password, argonOptions);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      role,
    },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });

  console.log("Utilisateur créé :", user);
}

createUser()
  .catch((error) => {
    console.error("Erreur lors de la création de l'utilisateur :", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
