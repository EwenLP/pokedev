import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPokemonDetails, fetchPokemonList } from "../api/pokemonApi";

const TEAM_STORAGE_KEY = "pokebuild_saved_teams";

function generateSimplePdf(teamName, team) {
  const lines = [
    `Pokebuild - ${teamName}`,
    `Nombre de Pokémon : ${team.length}/6`,
    "",
    ...team.map(
      (pokemon, index) => `${index + 1}. ${pokemon.name} - Types: ${pokemon.types.join(", ")}`
    ),
  ];

  const escapeText = (text) => text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

  const textCommands = lines
    .map((line, index) => `BT /F1 12 Tf 50 ${780 - index * 20} Td (${escapeText(line)}) Tj ET`)
    .join("\n");

  const contentStream = `${textCommands}\n`;

  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${contentStream.length} >> stream\n${contentStream}endstream endobj`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

export default function TeamBuilder() {
  const [teamName, setTeamName] = useState("Mon équipe");
  const [allPokemon, setAllPokemon] = useState([]);
  const [team, setTeam] = useState([]);
  const [selectedPokemonId, setSelectedPokemonId] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    async function loadPokemon() {
      const list = await fetchPokemonList();

      const detailedPokemon = await Promise.all(
        list.map(async (pokemon) => {
          const details = await fetchPokemonDetails(pokemon.url);
          return {
            id: details.id,
            name: details.name,
            image: details.sprites.other["official-artwork"].front_default,
            types: details.types.map((t) => t.type.name),
          };
        })
      );

      setAllPokemon(detailedPokemon);
    }

    loadPokemon();
  }, []);

  const selectablePokemon = useMemo(
    () => allPokemon.filter((pokemon) => !team.some((p) => p.id === pokemon.id)),
    [allPokemon, team]
  );

  function addPokemonToTeam() {
    if (!selectedPokemonId || team.length >= 6) return;

    const pokemonToAdd = allPokemon.find((pokemon) => pokemon.id === Number(selectedPokemonId));
    if (!pokemonToAdd) return;

    setTeam((currentTeam) => [...currentTeam, pokemonToAdd]);
    setSelectedPokemonId("");
    setSavedMessage("");
  }

  function removePokemonFromTeam(id) {
    setTeam((currentTeam) => currentTeam.filter((pokemon) => pokemon.id !== id));
    setSavedMessage("");
  }

  function saveTeam() {
    if (team.length === 0) {
      setSavedMessage("Ajoutez au moins un Pokémon avant de sauvegarder.");
      return;
    }

    const existingTeams = JSON.parse(localStorage.getItem(TEAM_STORAGE_KEY) ?? "[]");
    const teamToSave = {
      id: Date.now(),
      name: teamName.trim() || "Mon équipe",
      createdAt: new Date().toISOString(),
      pokemons: team,
    };

    localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify([...existingTeams, teamToSave]));
    setSavedMessage("Équipe sauvegardée avec succès.");
  }

  function generatePdf() {
    if (team.length === 0) {
      setSavedMessage("Ajoutez au moins un Pokémon pour générer le PDF.");
      return;
    }

    const currentTeamName = teamName.trim() || "Mon équipe";
    const blob = generateSimplePdf(currentTeamName, team);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentTeamName.toLowerCase().replace(/\s+/g, "-") || "mon-equipe"}.pdf`;
    link.click();
    URL.revokeObjectURL(url);

    setSavedMessage("PDF généré avec succès.");
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Team Builder</h1>
        <Link className="px-4 py-2 bg-slate-700 rounded" to="/pokedex">
          Retour au Pokédex
        </Link>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <label className="block mb-2">Nom de l&apos;équipe</label>
        <input
          className="w-full md:w-1/2 p-2 rounded border border-white text-white"
          value={teamName}
          onChange={(event) => setTeamName(event.target.value)}
        />
      </div>

      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Ajouter un Pokémon ({team.length}/6)</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <select
            className="text-white bg-slate-700 p-2 rounded w-full md:w-2/3"
            value={selectedPokemonId}
            onChange={(event) => setSelectedPokemonId(event.target.value)}
          >
            <option value="">Choisir un Pokémon</option>
            {selectablePokemon.map((pokemon) => (
              <option key={pokemon.id} value={pokemon.id}>
                #{pokemon.id} - {pokemon.name}
              </option>
            ))}
          </select>
          <button
            className="px-4 py-2 bg-blue-600 rounded disabled:opacity-60"
            onClick={addPokemonToTeam}
            disabled={team.length >= 6 || !selectedPokemonId}
          >
            Ajouter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map((pokemon) => (
          <div key={pokemon.id} className="bg-slate-800 p-4 rounded">
            <img src={pokemon.image} alt={pokemon.name} className="mx-auto w-24" />
            <p className="mt-3 text-lg capitalize text-center">{pokemon.name}</p>
            <div className="flex justify-center gap-2 mt-2 flex-wrap">
              {pokemon.types.map((type) => (
                <span key={type} className="bg-slate-600 px-2 py-1 rounded text-xs">
                  {type}
                </span>
              ))}
            </div>
            <button
              className="mt-4 w-full px-3 py-2 bg-red-700 rounded"
              onClick={() => removePokemonFromTeam(pokemon.id)}
            >
              Retirer
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mt-8">
        <button className="px-4 py-2 bg-emerald-600 rounded" onClick={saveTeam}>
          Sauvegarder l&apos;équipe
        </button>
        <button className="px-4 py-2 bg-purple-600 rounded" onClick={generatePdf}>
          Générer le PDF
        </button>
      </div>

      {savedMessage && <p className="mt-4 text-sm text-emerald-300">{savedMessage}</p>}
    </div>
  );
}
