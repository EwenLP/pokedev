import { useEffect, useMemo, useState, useRef } from "react";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { fetchAllPokemon } from "../api/pokemonApi";
import { getToken } from "../utils/auth";
import { createTeam, updateTeam } from "../api/teamApi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Type color mapping
const TYPE_COLORS = {
  feu: { bg: "#c84c00", text: "#ffb347" },
  eau: { bg: "#1a4a7a", text: "#7dd3fc" },
  plante: { bg: "#1a4a1a", text: "#86efac" },
  électrik: { bg: "#2a2a00", text: "#facc15" },
  electrik: { bg: "#2a2a00", text: "#facc15" },
  vol: { bg: "#1a1a3a", text: "#a5b4fc" },
  poison: { bg: "#2a0a2a", text: "#c084fc" },
  psy: { bg: "#3a0a1a", text: "#f9a8d4" },
  combat: { bg: "#3a1a00", text: "#fb923c" },
  roche: { bg: "#2a2a1a", text: "#d4d4aa" },
  sol: { bg: "#3a2a00", text: "#fde68a" },
  glace: { bg: "#0a2a3a", text: "#bae6fd" },
  dragon: { bg: "#1a0a3a", text: "#818cf8" },
  spectre: { bg: "#1a0a2a", text: "#a78bfa" },
  acier: { bg: "#1a1a2a", text: "#94a3b8" },
  normal: { bg: "#2a2a2a", text: "#d1d5db" },
  ténèbres: { bg: "#0a0a1a", text: "#6b7280" },
  fée: { bg: "#3a0a2a", text: "#f9a8d4" },
  insecte: { bg: "#1a2a00", text: "#a3e635" },
};

// Pokemon card background gradients based on type
const TYPE_GRADIENTS = {
  feu: "linear-gradient(135deg, #7c2d12 0%, #9a3412 50%, #431407 100%)",
  eau: "linear-gradient(135deg, #0c4a6e 0%, #075985 50%, #082f49 100%)",
  plante: "linear-gradient(135deg, #14532d 0%, #166534 50%, #052e16 100%)",
  électrik: "linear-gradient(135deg, #713f12 0%, #854d0e 50%, #422006 100%)",
  electrik: "linear-gradient(135deg, #713f12 0%, #854d0e 50%, #422006 100%)",
  vol: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #0f0e2a 100%)",
  poison: "linear-gradient(135deg, #3b0764 0%, #4c1d95 50%, #1e0a3c 100%)",
  psy: "linear-gradient(135deg, #4c0519 0%, #881337 50%, #27020d 100%)",
  combat: "linear-gradient(135deg, #431407 0%, #7c2d12 50%, #27080b 100%)",
  normal: "linear-gradient(135deg, #1c1917 0%, #292524 50%, #0c0a09 100%)",
  default: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #0f172a 100%)",
};

function getTypeGradient(types) {
  if (!types || types.length === 0) return TYPE_GRADIENTS.default;
  const key = types[0].toLowerCase();
  return TYPE_GRADIENTS[key] || TYPE_GRADIENTS.default;
}

function getTypeStyle(type) {
  const key = type.toLowerCase();
  return TYPE_COLORS[key] || { bg: "#2a2a2a", text: "#d1d5db" };
}

function generateTeamPrintableHtml(teamName, team) {
  const cards = team
      .map(
          (pokemon) => `
      <article style="border:1px solid #334155;border-radius:16px;padding:16px;text-align:center;break-inside:avoid;background:#1e293b;">
        <img src="${pokemon.image}" alt="${pokemon.name}" style="width:120px;height:120px;object-fit:contain;display:block;margin:0 auto 8px;" />
        <h3 style="margin:0 0 8px;text-transform:capitalize;color:#f1f5f9;font-size:18px;">${pokemon.name}</h3>
        <p style="margin:0 0 8px;color:#94a3b8;">Types: ${pokemon.types.join(", ")}</p>
        ${
              pokemon.stats
                  ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:12px;color:#cbd5e1;">
          <span>❤️ PV: ${pokemon.stats.hp}</span>
          <span>⚔️ Atk: ${pokemon.stats.attack}</span>
          <span>🛡️ Def: ${pokemon.stats.defense}</span>
          <span>⚡ Vit: ${pokemon.stats.speed}</span>
        </div>`
                  : ""
          }
      </article>`
      )
      .join("");

  const avg = (key) =>
      team.length ? Math.round(team.reduce((s, p) => s + (p.stats?.[key] || 0), 0) / team.length) : 0;

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${teamName}</title>
  <style>body{background:#0f172a;color:#f1f5f9;font-family:'Segoe UI',sans-serif;padding:24px;}</style>
</head>
<body>
  <h1 style="margin:0 0 4px;color:#22d3ee;">${teamName}</h1>
  <p style="margin:0 0 20px;color:#94a3b8;">Équipe de ${team.length}/6 Pokémon</p>
  <section style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;">
    ${cards}
  </section>
  <div style="margin-top:24px;padding:16px;border:1px solid #334155;border-radius:16px;background:#1e293b;">
    <h2 style="margin:0 0 12px;color:#22d3ee;">Résumé de l'équipe</h2>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;text-align:center;">
      <div><div style="font-size:24px;font-weight:bold;">${avg("hp")}</div><div style="color:#94a3b8;font-size:12px;">PV moyens</div></div>
      <div><div style="font-size:24px;font-weight:bold;">${avg("attack")}</div><div style="color:#94a3b8;font-size:12px;">Attaque moy.</div></div>
      <div><div style="font-size:24px;font-weight:bold;">${avg("defense")}</div><div style="color:#94a3b8;font-size:12px;">Défense moy.</div></div>
      <div><div style="font-size:24px;font-weight:bold;">${avg("speed")}</div><div style="color:#94a3b8;font-size:12px;">Vitesse moy.</div></div>
    </div>
  </div>
</body>
</html>`;
}

function TypeBadge({ type }) {
  const style = getTypeStyle(type);
  return (
      <span
          style={{
            background: style.bg,
            color: style.text,
            padding: "2px 10px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.02em",
            border: `1px solid ${style.text}33`,
          }}
      >
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}

function StatRow({ icon, value, label }) {
  return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        <span style={{ fontSize: 13, color: "#94a3b8" }}>{icon}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{value}</span>
      </div>
  );
}

function PokemonSlot({ pokemon, index, onRemove, onAdd, selectablePokemon, selectedId, onSelectChange }) {
  if (!pokemon) {
    return (
        <div
            style={{
              background: "#0f1b2d",
              border: "1.5px dashed #1e3a5a",
              borderRadius: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              minHeight: 220,
              cursor: "pointer",
              transition: "all 0.2s",
              position: "relative",
              overflow: "hidden",
            }}
        >
          <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: "2px solid #22d3ee44",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#22d3ee11",
              }}
          >
            <span style={{ color: "#22d3ee", fontSize: 24, lineHeight: 1 }}>+</span>
          </div>
          <p style={{ color: "#475569", fontSize: 14, fontWeight: 500, margin: 0 }}>Slot #{index + 1}</p>
          <p style={{ color: "#334155", fontSize: 12, margin: 0 }}>Ajouter un Pokémon</p>
        </div>
    );
  }

  const gradient = getTypeGradient(pokemon.types);

  return (
      <div
          style={{
            background: "#0d1f35",
            border: "1px solid #1e3a5a",
            borderRadius: 20,
            overflow: "hidden",
            position: "relative",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      >
        {/* Slot number */}
        <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              background: "#00000066",
              color: "#94a3b8",
              fontSize: 11,
              fontWeight: 700,
              padding: "2px 7px",
              borderRadius: 6,
              zIndex: 2,
              letterSpacing: "0.05em",
            }}
        >
          #{String(index + 1).padStart(2, "0")}
        </div>

        {/* Remove button */}
        <button
            onClick={() => onRemove(pokemon.id)}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "#ff444433",
              border: "1px solid #ff444466",
              color: "#ff6666",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              zIndex: 2,
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#ff4444";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ff444433";
              e.currentTarget.style.color = "#ff6666";
            }}
        >
          ✕
        </button>

        {/* Image area with gradient */}
        <div
            style={{
              background: gradient,
              height: 140,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
        >
          <img
              src={pokemon.image}
              alt={pokemon.name}
              style={{ width: 110, height: 110, objectFit: "contain", filter: "drop-shadow(0 4px 16px #00000088)" }}
          />
        </div>

        {/* Info area */}
        <div style={{ padding: "12px 14px 14px" }}>
          <p
              style={{
                margin: "0 0 8px",
                fontSize: 16,
                fontWeight: 700,
                textAlign: "center",
                color: "#f1f5f9",
                textTransform: "capitalize",
              }}
          >
            {pokemon.name}
          </p>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginBottom: 12 }}>
            {pokemon.types.map((t) => (
                <TypeBadge key={t} type={t} />
            ))}
          </div>
          {pokemon.stats && (
              <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "6px 16px",
                    background: "#ffffff08",
                    borderRadius: 10,
                    padding: "8px 12px",
                  }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color: "#f87171", fontSize: 12 }}>♥</span>
                  <span style={{ color: "#94a3b8", fontSize: 12 }}>{pokemon.stats.hp}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color: "#fb923c", fontSize: 12 }}>⚔</span>
                  <span style={{ color: "#94a3b8", fontSize: 12 }}>{pokemon.stats.attack}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color: "#60a5fa", fontSize: 12 }}>◎</span>
                  <span style={{ color: "#94a3b8", fontSize: 12 }}>{pokemon.stats.defense}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color: "#facc15", fontSize: 12 }}>⚡</span>
                  <span style={{ color: "#94a3b8", fontSize: 12 }}>{pokemon.stats.speed}</span>
                </div>
              </div>
          )}
        </div>
      </div>
  );
}

function TeamSummary({ team }) {
  if (team.length === 0) return null;
  const withStats = team.filter((p) => p.stats);
  const avg = (key) =>
      withStats.length ? Math.round(withStats.reduce((s, p) => s + (p.stats[key] || 0), 0) / withStats.length) : "—";

  return (
      <div
          style={{
            background: "#0d1f35",
            border: "1px solid #1e3a5a",
            borderRadius: 20,
            padding: "20px 28px",
            marginTop: 24,
          }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <span style={{ color: "#22d3ee", fontSize: 18 }}>◎</span>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#f1f5f9" }}>Résumé de l'équipe</span>
        </div>
        <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 16,
              textAlign: "center",
            }}
        >
          {[
            { icon: "♥", color: "#f87171", value: avg("hp"), label: "PV moyens" },
            { icon: "⚔", color: "#fb923c", value: avg("attack"), label: "Attaque moy." },
            { icon: "◎", color: "#60a5fa", value: avg("defense"), label: "Défense moy." },
            { icon: "⚡", color: "#facc15", value: avg("speed"), label: "Vitesse moy." },
          ].map(({ icon, color, value, label }) => (
              <div key={label}>
                <div style={{ color, fontSize: 20, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#f1f5f9", lineHeight: 1 }}>{value}</div>
                <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>{label}</div>
              </div>
          ))}
        </div>
      </div>
  );
}

// Modal to add pokemon
function AddPokemonModal({ selectablePokemon, onAdd, onClose }) {
  const [search, setSearch] = useState("");
  const filtered = selectablePokemon.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
      <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#000000bb",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={onClose}
      >
        <div
            style={{
              background: "#0d1f35",
              border: "1px solid #1e3a5a",
              borderRadius: 20,
              padding: 24,
              width: "100%",
              maxWidth: 480,
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
            onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, color: "#f1f5f9", fontSize: 18, fontWeight: 700 }}>Ajouter un Pokémon</h3>
            <button
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  color: "#64748b",
                  cursor: "pointer",
                  fontSize: 20,
                }}
            >
              ✕
            </button>
          </div>
          <input
              autoFocus
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: "#ffffff0a",
                border: "1px solid #1e3a5a",
                borderRadius: 10,
                padding: "10px 14px",
                color: "#f1f5f9",
                fontSize: 14,
                outline: "none",
              }}
          />
          <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
            {filtered.slice(0, 60).map((p) => (
                <button
                    key={p.id}
                    onClick={() => { onAdd(p); onClose(); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "8px 12px",
                      background: "#ffffff05",
                      border: "1px solid #1e3a5a",
                      borderRadius: 10,
                      cursor: "pointer",
                      color: "#f1f5f9",
                      textAlign: "left",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#22d3ee11")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff05")}
                >
                  <img src={p.image} alt={p.name} style={{ width: 36, height: 36, objectFit: "contain" }} />
                  <span style={{ textTransform: "capitalize", fontWeight: 500 }}>
                #{String(p.id).padStart(3, "0")} {p.name}
              </span>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                    {p.types.map((t) => (
                        <TypeBadge key={t} type={t} />
                    ))}
                  </div>
                </button>
            ))}
          </div>
        </div>
      </div>
  );
}

export default function TeamBuilder() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const editTeamId = searchParams.get("edit");
  
  const [teamName, setTeamName] = useState("Mon Équipe");
  const [allPokemon, setAllPokemon] = useState([]);
  const [team, setTeam] = useState([]);
  const [message, setMessage] = useState(null); // { text, type: 'success'|'error' }
  const [showModal, setShowModal] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    async function loadPokemon() {
      const allPokemonData = await fetchAllPokemon();
      const mapped = allPokemonData.map((pokemon) => ({
        id: pokemon.id,
        name: pokemon.nameFr,
        image: pokemon.image,
        types: pokemon.types,
        stats: pokemon.stats || null,
      }));
      setAllPokemon(mapped);

      // Si on est en mode édition, on charge l'équipe
      if (editTeamId && location.state?.team) {
        const teamData = location.state.team;
        setTeamName(teamData.name);
        
        // On mappe les teamPokemons vers la structure attendue, 
        // en récupérant les types/stats depuis 'mapped'
        const restoredTeam = teamData.teamPokemons.map(tp => {
          const fullData = mapped.find(p => p.id === tp.pokemonApiId);
          return fullData || {
            id: tp.pokemonApiId,
            name: tp.pokemonName,
            image: tp.spriteUrl,
            types: [],
            stats: null
          };
        });
        setTeam(restoredTeam);
      }
    }
    loadPokemon();
  }, [editTeamId, location.state]);

  useEffect(() => {
    if (editingName && nameInputRef.current) nameInputRef.current.focus();
  }, [editingName]);

  const selectablePokemon = useMemo(
      () => allPokemon.filter((p) => !team.some((t) => t.id === p.id)),
      [allPokemon, team]
  );

  function addPokemon(pokemon) {
    if (team.length >= 6) return;
    setTeam((t) => [...t, pokemon]);
    setMessage(null);
  }

  function removePokemon(id) {
    setTeam((t) => t.filter((p) => p.id !== id));
    setMessage(null);
  }

  async function saveTeam() {
    if (team.length === 0) {
      setMessage({ text: "Ajoutez au moins un Pokémon avant de sauvegarder.", type: "error" });
      return;
    }
    try {
      const teamData = { name: teamName.trim() || "Mon Équipe", pokemons: team };
      let response;
      
      if (editTeamId) {
        response = await updateTeam(editTeamId, teamData);
      } else {
        response = await createTeam(teamData);
      }

      const data = await response.json();
      if (!response.ok) {
        setMessage({ text: data.message || "Erreur lors de la sauvegarde.", type: "error" });
        return;
      }
      setMessage({ 
        text: editTeamId ? "✓ Équipe mise à jour avec succès !" : "✓ Équipe sauvegardée avec succès !", 
        type: "success" 
      });
      
      if (editTeamId) {
        // Rediriger vers le profil après un court délai pour voir le message
        setTimeout(() => navigate("/profil"), 1500);
      }
    } catch {
      setMessage({ text: "Impossible de sauvegarder l'équipe.", type: "error" });
    }
  }

  function generatePdf() {
    if (team.length === 0) {
      setMessage({ text: "Ajoutez au moins un Pokémon pour générer le PDF.", type: "error" });
      return;
    }
    const printWindow = window.open("", "_blank", "width=1000,height=800");
    if (!printWindow) {
      setMessage({ text: "Le navigateur a bloqué les pop-ups. Autorisez-les et réessayez.", type: "error" });
      return;
    }
    printWindow.document.open();
    printWindow.document.write(generateTeamPrintableHtml(teamName.trim() || "Mon Équipe", team));
    printWindow.document.close();
    setTimeout(() => { printWindow.focus(); printWindow.print(); }, 500);
    setMessage({ text: "Aperçu prêt – utilisez « Enregistrer en PDF » pour exporter.", type: "success" });
  }

  return (
      <div
          style={{
            minHeight: "100vh",
            background: "#060e1a",
            color: "#f1f5f9",
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            padding: "32px 24px",
            maxWidth: 960,
            margin: "0 auto",
          }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            {editingName ? (
                <input
                    ref={nameInputRef}
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    onBlur={() => setEditingName(false)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
                    style={{
                      background: "transparent",
                      border: "none",
                      borderBottom: "2px solid #22d3ee",
                      color: "#22d3ee",
                      fontSize: 32,
                      fontWeight: 800,
                      outline: "none",
                      width: 300,
                      padding: "0 0 4px",
                    }}
                />
            ) : (
                <h1
                    onClick={() => setEditingName(true)}
                    style={{
                      margin: 0,
                      fontSize: 32,
                      fontWeight: 800,
                      color: "#22d3ee",
                      cursor: "text",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                    title="Cliquer pour modifier"
                >
                  {teamName}
                  <span style={{ fontSize: 14, color: "#334155", fontWeight: 400 }}>✎</span>
                </h1>
            )}
            <p style={{ margin: "4px 0 0", color: "#475569", fontSize: 14 }}>
              {editTeamId ? "Modifie ton équipe de 6 Pokémon" : "Compose ton équipe de 6 Pokémon"}
            </p>
          </div>

          {/* Team count badge */}
          <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#0d1f35",
                border: "1px solid #1e3a5a",
                borderRadius: 12,
                padding: "8px 16px",
              }}
          >
            <span style={{ fontWeight: 700, color: "#f1f5f9" }}>
            {team.length}
              <span style={{ color: "#475569" }}>/6</span>
          </span>
          </div>
        </div>

        {/* Grid */}
        <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
        >
          {Array.from({ length: 6 }).map((_, i) => {
            const pokemon = team[i] || null;
            return (
                <div
                    key={i}
                    onClick={!pokemon && team.length < 6 ? () => setShowModal(true) : undefined}
                    style={{ cursor: !pokemon ? "pointer" : "default" }}
                >
                  <PokemonSlot
                      pokemon={pokemon}
                      index={i}
                      onRemove={removePokemon}
                      onAdd={() => setShowModal(true)}
                  />
                </div>
            );
          })}
        </div>

        {/* Team Summary */}
        <TeamSummary team={team} />

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
          {team.length < 6 && (
              <button
                  onClick={() => setShowModal(true)}
                  style={{
                    padding: "11px 22px",
                    background: "#22d3ee22",
                    border: "1px solid #22d3ee55",
                    borderRadius: 12,
                    color: "#22d3ee",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 14,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#22d3ee33")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#22d3ee22")}
              >
                + Ajouter un Pokémon
              </button>
          )}
          <button
              onClick={saveTeam}
              style={{
                padding: "11px 22px",
                background: "#059669",
                border: "none",
                borderRadius: 12,
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 14,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#047857")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#059669")}
          >
            {editTeamId ? "Mettre à jour l'équipe" : "Sauvegarder l'équipe"}
          </button>
          <button
              onClick={generatePdf}
              style={{
                padding: "11px 22px",
                background: "#7c3aed",
                border: "none",
                borderRadius: 12,
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 14,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#6d28d9")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#7c3aed")}
          >
            Export PDF
          </button>
        </div>

        {/* Message */}
        {message && (
            <div
                style={{
                  marginTop: 16,
                  padding: "10px 16px",
                  borderRadius: 10,
                  background: message.type === "success" ? "#05966922" : "#dc262622",
                  border: `1px solid ${message.type === "success" ? "#05966966" : "#dc262666"}`,
                  color: message.type === "success" ? "#34d399" : "#f87171",
                  fontSize: 14,
                }}
            >
              {message.text}
            </div>
        )}

        {/* Modal */}
        {showModal && (
            <AddPokemonModal
                selectablePokemon={selectablePokemon}
                onAdd={addPokemon}
                onClose={() => setShowModal(false)}
            />
        )}
      </div>
  );
}