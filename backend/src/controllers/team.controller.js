const prisma = require("../config/prisma");

const listMyTeams = async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        teamPokemons: {
          orderBy: { slot: "asc" },
        },
      },
    });

    return res.status(200).json(teams);
  } catch (error) {
    console.error("Erreur listMyTeams :", error);
    return res.status(500).json({ message: "Erreur serveur lors de la récupération des équipes." });
  }
};

const createTeam = async (req, res) => {
  try {
    const { name, description, pokemons } = req.body;

    const teamName = (name || "Mon équipe").trim() || "Mon équipe";
    if (teamName.length > 100) {
      return res.status(400).json({ message: "Le nom d'équipe ne doit pas dépasser 100 caractères." });
    }
    const teamDescription = description?.trim() || null;
    if (teamDescription && teamDescription.length > 500) {
      return res.status(400).json({ message: "La description ne doit pas dépasser 500 caractères." });
    }

    const validation = validatePokemons(pokemons);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    const team = await prisma.team.create({
      data: {
        userId: req.user.id,
        name: teamName,
        description: teamDescription,
        teamPokemons: {
          create: validation.normalizedPokemons,
        },
      },
      include: {
        teamPokemons: {
          orderBy: { slot: "asc" },
        },
      },
    });

    return res.status(201).json({ message: "Équipe sauvegardée en base.", team });
  } catch (error) {
    console.error("Erreur createTeam :", error);
    return res.status(500).json({ message: "Erreur serveur lors de la sauvegarde de l'équipe." });
  }
};

const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, pokemons } = req.body;

    const existingTeam = await prisma.team.findUnique({
      where: { id: Number(id) },
    });

    if (!existingTeam) {
      return res.status(404).json({ message: "Équipe non trouvée." });
    }

    if (existingTeam.userId !== req.user.id) {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier cette équipe." });
    }

    const teamName = (name || "Mon équipe").trim() || "Mon équipe";
    if (teamName.length > 100) {
      return res.status(400).json({ message: "Le nom d'équipe ne doit pas dépasser 100 caractères." });
    }
    const teamDescription = description?.trim() || null;
    if (teamDescription && teamDescription.length > 500) {
      return res.status(400).json({ message: "La description ne doit pas dépasser 500 caractères." });
    }

    const validation = validatePokemons(pokemons);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    // Supprimer les anciens pokémons et mettre à jour l'équipe
    const team = await prisma.team.update({
      where: { id: Number(id) },
      data: {
        name: teamName,
        description: teamDescription,
        teamPokemons: {
          deleteMany: {},
          create: validation.normalizedPokemons,
        },
      },
      include: {
        teamPokemons: {
          orderBy: { slot: "asc" },
        },
      },
    });

    return res.status(200).json({ message: "Équipe mise à jour.", team });
  } catch (error) {
    console.error("Erreur updateTeam :", error);
    return res.status(500).json({ message: "Erreur serveur lors de la mise à jour de l'équipe." });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const existingTeam = await prisma.team.findUnique({
      where: { id: Number(id) },
    });

    if (!existingTeam) {
      return res.status(404).json({ message: "Équipe non trouvée." });
    }

    if (existingTeam.userId !== req.user.id) {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer cette équipe." });
    }

    await prisma.team.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({ message: "Équipe supprimée avec succès." });
  } catch (error) {
    console.error("Erreur deleteTeam :", error);
    return res.status(500).json({ message: "Erreur serveur lors de la suppression de l'équipe." });
  }
};

// Fonction utilitaire de validation
function validatePokemons(pokemons) {
  if (!Array.isArray(pokemons) || pokemons.length === 0 || pokemons.length > 6) {
    return { valid: false, message: "Une équipe doit contenir entre 1 et 6 Pokémon." };
  }

  const normalizedPokemons = pokemons.map((pokemon, index) => ({
    pokemonApiId: Number(pokemon.id ?? pokemon.pokemonApiId),
    pokemonName: pokemon.name ?? pokemon.pokemonName,
    spriteUrl: pokemon.image ?? pokemon.spriteUrl ?? null,
    slot: index + 1,
  }));

  const hasInvalidPokemon = normalizedPokemons.some(
    (pokemon) => !pokemon.pokemonApiId || !pokemon.pokemonName
  );

  if (hasInvalidPokemon) {
    return { valid: false, message: "Les données Pokémon envoyées sont invalides." };
  }

  const hasDuplicate = new Set(normalizedPokemons.map((pokemon) => pokemon.pokemonApiId)).size !== normalizedPokemons.length;

  if (hasDuplicate) {
    return { valid: false, message: "Une équipe ne peut pas contenir deux fois le même Pokémon." };
  }

  return { valid: true, normalizedPokemons };
}

module.exports = {
  listMyTeams,
  createTeam,
  updateTeam,
  deleteTeam,
};
