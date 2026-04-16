const argon2 = require("argon2");
const prisma = require("../config/prisma");
const { EMAIL_REGEX, PASSWORD_REGEX, generateToken } = require("../utils/authUtils");

const argonOptions = {
  type: argon2.argon2id,
  timeCost: 3,
  memoryCost: 65536,
  parallelism: 1,
};

const tryVerifyPassword = async (storedPasswordHash, rawPassword) => {
  if (!storedPasswordHash || !rawPassword) {
    return { isValid: false, needsRehash: false };
  }

  try {
    const isArgonValid = await argon2.verify(storedPasswordHash, rawPassword);
    return { isValid: isArgonValid, needsRehash: false };
  } catch {
    const isLegacyPlainTextValid = storedPasswordHash === rawPassword;
    return { isValid: isLegacyPlainTextValid, needsRehash: isLegacyPlainTextValid };
  }
};

const register = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const normalizedEmail = (email || "").trim().toLowerCase();
    const normalizedUsername = (username || "").trim();

    if (!normalizedEmail || !normalizedUsername || !password) {
      return res.status(400).json({
        message: "Email, username et mot de passe sont obligatoires.",
      });
    }

    if (normalizedEmail.length > 255 || !EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Format d'email invalide.",
      });
    }

    if (normalizedUsername.length < 3 || normalizedUsername.length > 50) {
      return res.status(400).json({
        message: "Le username doit contenir entre 3 et 50 caractères.",
      });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.",
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { username: normalizedUsername }],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Un utilisateur avec cet email ou ce username existe déjà.",
      });
    }

    const passwordHash = await argon2.hash(password, argonOptions);

    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        username: normalizedUsername,
        passwordHash,
        role: "USER",
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    const token = generateToken(newUser);

    return res.status(201).json({
      message: "Utilisateur créé avec succès.",
      user: newUser,
      token,
    });
  } catch (error) {
    console.error("Erreur register :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de l'inscription.",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, username, identifier, password } = req.body;
    const loginIdentifier = (identifier || email || username || "").trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        message: "Email/username et mot de passe sont obligatoires.",
      });
    }

    const normalizedIdentifier = loginIdentifier.toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedIdentifier },
          { email: loginIdentifier },
          { username: loginIdentifier },
          { username: normalizedIdentifier },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Identifiants invalides.",
      });
    }

    const { isValid: isPasswordValid, needsRehash } = await tryVerifyPassword(
      user.passwordHash,
      password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Identifiants invalides.",
      });
    }

    if (needsRehash) {
      const upgradedPasswordHash = await argon2.hash(password, argonOptions);

      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: upgradedPasswordHash },
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: "Connexion réussie.",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Erreur login :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la connexion.",
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        teams: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            name: true,
            createdAt: true,
            teamPokemons: {
              orderBy: { slot: "asc" },
              select: {
                id: true,
                pokemonApiId: true,
                pokemonName: true,
                spriteUrl: true,
                slot: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable.",
      });
    }

    return res.status(200).json({
      ...user,
      teamsCount: user.teams.length,
      latestTeam: user.teams[0] || null,
    });
  } catch (error) {
    console.error("Erreur getProfile :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération du profil.",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { email, username } = req.body;
    const userId = req.user.id;

    const normalizedEmail = email ? email.trim().toLowerCase() : undefined;
    const normalizedUsername = username ? username.trim() : undefined;

    if (normalizedEmail && (normalizedEmail.length > 255 || !EMAIL_REGEX.test(normalizedEmail))) {
      return res.status(400).json({ message: "Format d'email invalide." });
    }

    if (normalizedUsername && (normalizedUsername.length < 3 || normalizedUsername.length > 50)) {
      return res.status(400).json({ message: "Le username doit contenir entre 3 et 50 caractères." });
    }

    if (normalizedEmail || normalizedUsername) {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            normalizedEmail ? { email: normalizedEmail } : null,
            normalizedUsername ? { username: normalizedUsername } : null,
          ].filter(Boolean),
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        return res.status(409).json({
          message: "Ce pseudo ou cet email est déjà utilisé par un autre dresseur.",
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(normalizedEmail && { email: normalizedEmail }),
        ...(normalizedUsername && { username: normalizedUsername }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
      },
    });

    const newToken = generateToken(updatedUser);

    return res.status(200).json({
      message: "Profil mis à jour avec succès.",
      user: updatedUser,
      token: newToken,
    });
  } catch (error) {
    console.error("Erreur updateProfile :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la mise à jour du profil.",
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  tryVerifyPassword
};