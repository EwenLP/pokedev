require("dotenv").config();

const argon2 = require("argon2");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const usersToSeed = [
  {
    email: "admin@pokebuild.com",
    username: "admin",
    password: "Admin123!",
    role: "ADMIN",
  },
  {
    email: "user@pokebuild.com",
    username: "user",
    password: "User123!",
    role: "USER",
  },
];

const argonOptions = {
  type: argon2.argon2id,
  timeCost: 3,
  memoryCost: 65536,
  parallelism: 1,
};

async function seedUsers() {
  for (const user of usersToSeed) {
    const passwordHash = await argon2.hash(user.password, argonOptions);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        username: user.username,
        passwordHash,
        role: user.role,
      },
      create: {
        email: user.email,
        username: user.username,
        passwordHash,
        role: user.role,
      },
    });
  }

  console.log("Seed users terminé.");
}

seedUsers()
  .catch((error) => {
    console.error("Erreur seed users:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
