const prisma = require("../config/prisma");

const listMyFavorites = async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(favorites);
  } catch (error) {
    console.error("Erreur listMyFavorites :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération des favoris.",
    });
  }
};

const addFavorite = async (req, res) => {
  try {
    const { pokemonApiId, pokemonName, spriteUrl } = req.body;

    const favorite = await prisma.favorite.create({
      data: {
        userId: req.user.id,
        pokemonApiId: Number(pokemonApiId),
        pokemonName,
        spriteUrl: spriteUrl ?? null,
      },
    });

    return res.status(201).json({
      message: "Favori ajouté.",
      favorite,
    });
  } catch (error) {
    console.error("Erreur addFavorite :", error);

    // ⚠️ important (unique constraint)
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Déjà en favori.",
      });
    }

    return res.status(500).json({
      message: "Erreur serveur.",
    });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const pokemonApiId = Number(req.params.id);

    await prisma.favorite.delete({
      where: {
        userId_pokemonApiId: {
          userId: req.user.id,
          pokemonApiId,
        },
      },
    });

    return res.status(200).json({
      message: "Favori supprimé.",
    });
  } catch (error) {
    console.error("Erreur removeFavorite :", error);
    return res.status(500).json({
      message: "Erreur serveur.",
    });
  }
};

module.exports = {
  listMyFavorites,
  addFavorite,
  removeFavorite,
};