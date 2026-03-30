import { useEffect, useMemo, useState, useRef } from "react";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { fetchAllPokemon } from "../api/pokemonApi";
import { createTeam, updateTeam } from "../api/teamApi";
import TypeBadge from "../components/TypeBadge";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function escapeHtml(text) {
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

function generateTeamPrintableHtml(teamName, team) {
  const safeTeamName = escapeHtml(teamName);
  const cards = team
      .map(
          (pokemon) => `
      <article style="border:1px solid #334155;border-radius:16px;padding:16px;text-align:center;break-inside:avoid;background:#1e293b;">
        <img src="${escapeHtml(pokemon.image)}" alt="${escapeHtml(pokemon.name)}" style="width:120px;height:120px;object-fit:contain;display:block;margin:0 auto 8px;" />
        <h3 style="margin:0 0 8px;text-transform:capitalize;color:#f1f5f9;font-size:18px;">${escapeHtml(pokemon.name)}</h3>
        <p style="margin:0 0 8px;color:#94a3b8;">Types: ${pokemon.types.map(t => escapeHtml(t)).join(", ")}</p>
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
  <title>${safeTeamName}</title>
  <style>body{background:#0f172a;color:#f1f5f9;font-family:'Segoe UI',sans-serif;padding:24px;}</style>
</head>
<body>
  <h1 style="margin:0 0 4px;color:#22d3ee;">${safeTeamName}</h1>
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

        {/* Image area */}
        <div
            style={{
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
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
          className="fixed inset-0 bg-black/70 z-100 flex items-center justify-center p-6"
          onClick={onClose}
      >
        <div
            className="bg-[#0d1f35] border border-[#1e3a5a] rounded-2xl p-6 w-full max-w-[480px] max-h-[80vh] flex flex-col gap-4 overflow-hidden"
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
      <div className="min-h-screen bg-[#060e1a] text-[#f1f5f9] px-6 py-8 max-w-[960px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-8">
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
                      width: "100%",
                      maxWidth: 300,
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
        <div className="flex flex-col sm:flex-row gap-3 mt-6 flex-wrap">
          {team.length < 6 && (
              <button
                  onClick={() => setShowModal(true)}
                  className="w-full sm:w-auto"
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
              className="w-full sm:w-auto"
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
              className="w-full sm:w-auto"
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