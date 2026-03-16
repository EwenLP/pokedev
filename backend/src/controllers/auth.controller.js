const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const argonOptions = {
  type: argon2.argon2id,
  timeCost: 3,
  memoryCost: 65536,
  parallelism: 1,
};

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

const register = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({
        message: "Email, username et mot de passe sont obligatoires.",
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
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
        email,
        username,
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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email et mot de passe sont obligatoires.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: "Identifiants invalides.",
      });
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Identifiants invalides.",
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
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable.",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Erreur getProfile :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération du profil.",
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
};
