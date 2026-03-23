import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPokemonDetails, fetchPokemonList } from "../api/pokemonApi";
import { getToken } from "../utils/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function generateTeamPrintableHtml(teamName, team) {
  const cards = team
    .map(
      (pokemon) => `
      <article style="border:1px solid #ccc;border-radius:12px;padding:12px;text-align:center;break-inside:avoid;">
        <img src="${pokemon.image}" alt="${pokemon.name}" style="width:120px;height:120px;object-fit:contain;display:block;margin:0 auto 8px;" />
        <h3 style="margin:0 0 8px;text-transform:capitalize;">${pokemon.name}</h3>
        <p style="margin:0;color:#444;">Types: ${pokemon.types.join(", ")}</p>
      </article>`
    )
    .join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${teamName}</title>
</head>
<body style="font-family:Arial,sans-serif;padding:24px;">
  <h1 style="margin:0 0 10px;">Pokebuild - ${teamName}</h1>
  <p style="margin:0 0 20px;">Équipe de ${team.length}/6 Pokémon</p>
  <section style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;">
    ${cards}
  </section>
</body>
</html>`;
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

  async function saveTeam() {
    if (team.length === 0) {
      setSavedMessage("Ajoutez au moins un Pokémon avant de sauvegarder.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/teams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: teamName.trim() || "Mon équipe",
          pokemons: team,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSavedMessage(data.message || "Erreur lors de la sauvegarde de l'équipe.");
        return;
      }

      setSavedMessage("Équipe sauvegardée en base avec succès.");
    } catch {
      setSavedMessage("Impossible de sauvegarder l'équipe pour le moment.");
    }
  }

  function generatePdf() {
    if (team.length === 0) {
      setSavedMessage("Ajoutez au moins un Pokémon pour générer le PDF.");
      return;
    }

    const currentTeamName = teamName.trim() || "Mon équipe";
    const printWindow = window.open("", "_blank", "width=1000,height=800");

    if (!printWindow) {
      setSavedMessage("Le navigateur a bloqué l'ouverture du PDF (pop-up). Autorisez les pop-up.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(generateTeamPrintableHtml(currentTeamName, team));
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);

    setSavedMessage("Aperçu prêt : utilisez “Enregistrer en PDF” pour exporter avec les images.");
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
          Sauvegarder l&apos;équipe (base)
        </button>
        <button className="px-4 py-2 bg-purple-600 rounded" onClick={generatePdf}>
          Export PDF avec images
        </button>
      </div>

      {savedMessage && <p className="mt-4 text-sm text-emerald-300">{savedMessage}</p>}
    </div>
  );
}
