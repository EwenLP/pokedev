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

    if (!Array.isArray(pokemons) || pokemons.length === 0 || pokemons.length > 6) {
      return res.status(400).json({ message: "Une équipe doit contenir entre 1 et 6 Pokémon." });
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
      return res.status(400).json({ message: "Les données Pokémon envoyées sont invalides." });
    }

    const hasDuplicate = new Set(normalizedPokemons.map((pokemon) => pokemon.pokemonApiId)).size !== normalizedPokemons.length;

    if (hasDuplicate) {
      return res.status(400).json({ message: "Une équipe ne peut pas contenir deux fois le même Pokémon." });
    }

    const team = await prisma.team.create({
      data: {
        userId: req.user.id,
        name: (name || "Mon équipe").trim() || "Mon équipe",
        description: description?.trim() || null,
        teamPokemons: {
          create: normalizedPokemons,
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

module.exports = {
  listMyTeams,
  createTeam,
};
