const prisma = require("../config/prisma");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.user.count(),
    ]);

    return res.status(200).json({
      data: users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Erreur getAllUsers :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération des utilisateurs.",
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
    console.error("Erreur getUserById :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération de l'utilisateur.",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { email, username, role } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({
        message: "Utilisateur introuvable.",
      });
    }

    if (role && !["USER", "ADMIN"].includes(role)) {
      return res.status(400).json({
        message: "Le rôle doit être USER ou ADMIN.",
      });
    }

    if (email && (typeof email !== "string" || email.length > 255 || !EMAIL_REGEX.test(email.trim()))) {
      return res.status(400).json({ message: "Format d'email invalide." });
    }

    if (username && (typeof username !== "string" || username.length < 3 || username.length > 50)) {
      return res.status(400).json({ message: "Le username doit contenir entre 3 et 50 caractères." });
    }

    if (email && email !== existingUser.email) {
      const emailAlreadyUsed = await prisma.user.findUnique({
        where: { email },
      });

      if (emailAlreadyUsed) {
        return res.status(409).json({
          message: "Cet email est déjà utilisé.",
        });
      }
    }

    if (username && username !== existingUser.username) {
      const usernameAlreadyUsed = await prisma.user.findUnique({
        where: { username },
      });

      if (usernameAlreadyUsed) {
        return res.status(409).json({
          message: "Ce username est déjà utilisé.",
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        email: email ?? existingUser.email,
        username: username ?? existingUser.username,
        role: role ?? existingUser.role,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      message: "Utilisateur mis à jour avec succès.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erreur updateUser :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la mise à jour.",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({
        message: "Utilisateur introuvable.",
      });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return res.status(200).json({
      message: "Utilisateur supprimé avec succès.",
    });
  } catch (error) {
    console.error("Erreur deleteUser :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la suppression.",
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};