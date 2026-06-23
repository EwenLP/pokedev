import { useEffect, useRef, useState } from "react";
import { getToken } from "../utils/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const POKEAPI_URL = "https://pokeapi.co/api/v2";

const COLOR_A = "#22d3ee";
const COLOR_B = "#818cf8";

const STAT_META = [
  { key: "hp",               label: "PV",        icon: "♥", color: "#f87171" },
  { key: "attack",           label: "Attaque",   icon: "⚔", color: "#fb923c" },
  { key: "defense",          label: "Défense",   icon: "◎", color: "#60a5fa" },
  { key: "special-attack",   label: "Atk. Spé.", icon: "✦", color: "#c084fc" },
  { key: "special-defense",  label: "Déf. Spé.", icon: "◈", color: "#34d399" },
  { key: "speed",            label: "Vitesse",   icon: "⚡", color: "#facc15" },
];

const TYPE_COLORS = {
  fire: "#fb923c", water: "#60a5fa", grass: "#4ade80",
  electric: "#facc15", psychic: "#f472b6", ice: "#bae6fd",
  dragon: "#818cf8", dark: "#6b7280", fairy: "#f9a8d4",
  normal: "#d1d5db", fighting: "#fb923c", flying: "#a5b4fc",
  poison: "#c084fc", ground: "#fde68a", rock: "#d4d4aa",
  bug: "#a3e635", ghost: "#a78bfa", steel: "#94a3b8",
};

async function fetchPokemonStats(id) {
  const key = `pstats_${id}`;
  const cached = sessionStorage.getItem(key);
  if (cached) return JSON.parse(cached);
  const res = await fetch(`${POKEAPI_URL}/pokemon/${id}`);
  const data = await res.json();
  const stats = {};
  data.stats.forEach((s) => { stats[s.stat.name] = s.base_stat; });
  const result = {
    stats,
    types: data.types.map((t) => t.type.name),
    image: data.sprites.other["official-artwork"].front_default,
  };
  sessionStorage.setItem(key, JSON.stringify(result));
  return result;
}

function calcAvg(list) {
  if (!list.length) return null;
  const totals = {};
  STAT_META.forEach((s) => (totals[s.key] = 0));
  list.forEach((p) => STAT_META.forEach((s) => { totals[s.key] += p.stats[s.key] || 0; }));
  const avgs = {};
  STAT_META.forEach((s) => { avgs[s.key] = Math.round(totals[s.key] / list.length); });
  return avgs;
}

function calcTypes(list) {
  const s = new Set();
  list.forEach((p) => p.types.forEach((t) => s.add(t)));
  return [...s];
}

// ── small reusable pieces ────────────────────────────────────────────────────

function TypeTag({ type }) {
  const c = TYPE_COLORS[type] || "#d1d5db";
  return (
    <span style={{
      background: c + "22", color: c, border: `1px solid ${c}44`,
      padding: "2px 9px", borderRadius: 999, fontSize: 11, fontWeight: 600,
      textTransform: "capitalize", whiteSpace: "nowrap",
    }}>
      {type}
    </span>
  );
}

function Skeleton({ w = "100%", h = 12, r = 6 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: "linear-gradient(90deg,#1e3a5a 0%,#0d2340 50%,#1e3a5a 100%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
    }} />
  );
}

// ── team selection card ──────────────────────────────────────────────────────

function SelectionCard({ team, roleA, roleB, onSelect }) {
  const role = roleA ? "A" : roleB ? "B" : null;
  const roleColor = role === "A" ? COLOR_A : role === "B" ? COLOR_B : null;

  return (
    <button
      onClick={() => onSelect(team.id)}
      style={{
        background: role ? `${roleColor}0d` : "#0d1f35",
        border: `2px solid ${role ? roleColor : "#1e3a5a"}`,
        borderRadius: 18,
        padding: "16px 18px",
        cursor: "pointer",
        textAlign: "left",
        color: "#f1f5f9",
        position: "relative",
        transition: "all 0.2s",
        boxShadow: role ? `0 0 20px ${roleColor}33` : "none",
      }}
      onMouseEnter={(e) => {
        if (!role) e.currentTarget.style.borderColor = "#334155";
      }}
      onMouseLeave={(e) => {
        if (!role) e.currentTarget.style.borderColor = "#1e3a5a";
      }}
    >
      {/* role badge */}
      {role && (
        <div style={{
          position: "absolute", top: -10, left: 16,
          background: roleColor, color: role === "A" ? "#0a1120" : "#fff",
          fontSize: 11, fontWeight: 800, padding: "2px 10px",
          borderRadius: 999, letterSpacing: "0.06em",
        }}>
          ÉQUIPE {role}
        </div>
      )}

      <p style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: role ? roleColor : "#f1f5f9" }}>
        {team.name}
      </p>

      {/* sprites */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {team.teamPokemons.map((p) => (
          <img
            key={p.id}
            src={p.spriteUrl}
            alt={p.pokemonName}
            title={p.pokemonName}
            style={{ width: 44, height: 44, objectFit: "contain", filter: role ? "none" : "brightness(0.7)" }}
          />
        ))}
      </div>

      <p style={{ margin: "10px 0 0", fontSize: 12, color: "#475569" }}>
        {team.teamPokemons.length} Pokémon
      </p>
    </button>
  );
}

// ── stat bar (center-diverging) ──────────────────────────────────────────────

function StatBar({ meta, valA, valB }) {
  const max = Math.max(valA, valB, 1);
  const pctA = Math.round((valA / max) * 100);
  const pctB = Math.round((valB / max) * 100);
  const winA = valA > valB, winB = valB > valA;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 1fr", gap: 10, alignItems: "center", padding: "8px 0" }}>
      {/* Team A side */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
        <span style={{
          fontSize: 14, fontWeight: 800, minWidth: 30, textAlign: "right",
          color: winA ? COLOR_A : winB ? "#334155" : "#64748b",
        }}>
          {valA}
          {winA && <span style={{ fontSize: 9, marginLeft: 3, color: "#4ade80" }}>▲</span>}
          {winB && <span style={{ fontSize: 9, marginLeft: 3, color: "#f87171" }}>▼</span>}
        </span>
        <div style={{ flex: 1, maxWidth: 140, height: 8, background: "#1e3a5a", borderRadius: 4, overflow: "hidden", display: "flex", justifyContent: "flex-end" }}>
          <div style={{
            height: "100%", width: `${pctA}%`,
            background: winA ? `linear-gradient(90deg, ${COLOR_A}88, ${COLOR_A})` : "#1e3a5a",
            borderRadius: 4, transition: "width 0.6s cubic-bezier(.4,0,.2,1)",
          }} />
        </div>
      </div>

      {/* Label */}
      <div style={{ textAlign: "center", lineHeight: 1 }}>
        <div style={{ fontSize: 16, color: meta.color, marginBottom: 3 }}>{meta.icon}</div>
        <div style={{ fontSize: 10, color: "#475569", fontWeight: 700, letterSpacing: "0.05em" }}>
          {meta.label}
        </div>
      </div>

      {/* Team B side */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, maxWidth: 140, height: 8, background: "#1e3a5a", borderRadius: 4, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${pctB}%`,
            background: winB ? `linear-gradient(90deg, ${COLOR_B}, ${COLOR_B}88)` : "#1e3a5a",
            borderRadius: 4, transition: "width 0.6s cubic-bezier(.4,0,.2,1)",
          }} />
        </div>
        <span style={{
          fontSize: 14, fontWeight: 800, minWidth: 30,
          color: winB ? COLOR_B : winA ? "#334155" : "#64748b",
        }}>
          {winB && <span style={{ fontSize: 9, marginRight: 3, color: "#4ade80" }}>▲</span>}
          {winA && <span style={{ fontSize: 9, marginRight: 3, color: "#f87171" }}>▼</span>}
          {valB}
        </span>
      </div>
    </div>
  );
}

// ── comparison section ───────────────────────────────────────────────────────

function ComparisonPanel({ teamA, teamB, statsA, statsB }) {
  const avgsA = calcAvg(statsA);
  const avgsB = calcAvg(statsB);
  const typesA = calcTypes(statsA);
  const typesB = calcTypes(statsB);

  let winsA = 0, winsB = 0;
  STAT_META.forEach((s) => {
    if (avgsA[s.key] > avgsB[s.key]) winsA++;
    else if (avgsB[s.key] > avgsA[s.key]) winsB++;
  });
  const winner = winsA > winsB ? teamA : winsB > winsA ? teamB : null;
  const winnerColor = winner === teamA ? COLOR_A : winner === teamB ? COLOR_B : null;

  return (
    <div style={{ marginTop: 40 }}>
      {/* Winner banner */}
      <div style={{
        background: winner
          ? `linear-gradient(135deg, ${winnerColor}22 0%, #0d1f35 100%)`
          : "#0d1f35",
        border: `1px solid ${winner ? winnerColor + "55" : "#1e3a5a"}`,
        borderRadius: 20,
        padding: "22px 28px",
        marginBottom: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}>
        {/* Team A score */}
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600, marginBottom: 4 }}>
            {teamA.name}
          </div>
          <div style={{ fontSize: 42, fontWeight: 900, color: winsA >= winsB ? COLOR_A : "#334155", lineHeight: 1 }}>
            {winsA}
          </div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>stats gagnées</div>
        </div>

        {/* VS / result */}
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          {winner ? (
            <>
              <div style={{
                background: winnerColor, color: winnerColor === COLOR_A ? "#0a1120" : "#fff",
                fontSize: 11, fontWeight: 800, padding: "4px 14px", borderRadius: 999,
                letterSpacing: "0.08em", marginBottom: 6,
              }}>
                VAINQUEUR
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: winnerColor }}>
                {winner.name}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: "#475569", fontWeight: 700 }}>ÉGALITÉ</div>
          )}
        </div>

        {/* Team B score */}
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600, marginBottom: 4 }}>
            {teamB.name}
          </div>
          <div style={{ fontSize: 42, fontWeight: 900, color: winsB >= winsA ? COLOR_B : "#334155", lineHeight: 1 }}>
            {winsB}
          </div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>stats gagnées</div>
        </div>
      </div>

      {/* Stat bars */}
      <div style={{ background: "#0d1f35", border: "1px solid #1e3a5a", borderRadius: 20, padding: "20px 28px", marginBottom: 16 }}>
        {/* Column headers */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 1fr", gap: 10, marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #1e3a5a" }}>
          <div style={{ textAlign: "right", fontSize: 13, fontWeight: 700, color: COLOR_A }}>{teamA.name}</div>
          <div style={{ textAlign: "center", fontSize: 12, color: "#475569" }}>moy.</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLOR_B }}>{teamB.name}</div>
        </div>
        {STAT_META.map((s) => (
          <StatBar key={s.key} meta={s} valA={avgsA[s.key]} valB={avgsB[s.key]} />
        ))}
      </div>

      {/* Pokémon rosters side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {[{ team: teamA, stats: statsA, color: COLOR_A }, { team: teamB, stats: statsB, color: COLOR_B }].map(({ team, stats, color }) => (
          <div key={team.id} style={{ background: "#0d1f35", border: `1px solid ${color}33`, borderRadius: 16, padding: 18 }}>
            <h4 style={{ margin: "0 0 14px", color, fontSize: 13, fontWeight: 700, letterSpacing: "0.04em" }}>
              {team.name.toUpperCase()}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {team.teamPokemons.map((p) => {
                const d = stats.find((s) => s.pokemonApiId === p.pokemonApiId);
                return (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <img
                      src={d?.image || p.spriteUrl}
                      alt={p.pokemonName}
                      style={{ width: 40, height: 40, objectFit: "contain", flexShrink: 0 }}
                    />
                    <span style={{ fontSize: 13, fontWeight: 600, textTransform: "capitalize", color: "#e2e8f0", flex: 1, minWidth: 0 }}>
                      {p.pokemonName}
                    </span>
                    {d && (
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        {d.types.map((t) => <TypeTag key={t} type={t} />)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Type coverage */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[{ team: teamA, types: typesA, color: COLOR_A }, { team: teamB, types: typesB, color: COLOR_B }].map(({ team, types, color }) => (
          <div key={team.id} style={{ background: "#0d1f35", border: `1px solid ${color}33`, borderRadius: 16, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h4 style={{ margin: 0, color, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em" }}>
                COUVERTURE DE TYPES
              </h4>
              <span style={{ background: color + "22", color, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>
                {types.length} types
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {types.map((t) => <TypeTag key={t} type={t} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── main page ────────────────────────────────────────────────────────────────

export default function TeamComparison() {
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [idA, setIdA] = useState(null);
  const [idB, setIdB] = useState(null);
  const [statsA, setStatsA] = useState([]);
  const [statsB, setStatsB] = useState([]);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const comparisonRef = useRef(null);

  useEffect(() => {
    // inject shimmer keyframe once
    if (!document.getElementById("shimmer-style")) {
      const el = document.createElement("style");
      el.id = "shimmer-style";
      el.textContent = `@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`;
      document.head.appendChild(el);
    }

    fetch(`${API_BASE_URL}/api/teams/me`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((d) => setTeams(Array.isArray(d) ? d : []))
      .catch(() => setTeams([]))
      .finally(() => setLoadingTeams(false));
  }, []);

  async function loadStats(team, setter, setLoading) {
    setLoading(true);
    try {
      const results = await Promise.all(
        team.teamPokemons.map(async (p) => {
          const d = await fetchPokemonStats(p.pokemonApiId);
          return { pokemonApiId: p.pokemonApiId, name: p.pokemonName, ...d };
        })
      );
      setter(results);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(teamId) {
    if (idA === teamId) {
      setIdA(null);
      setStatsA([]);
      return;
    }
    if (idB === teamId) {
      setIdB(null);
      setStatsB([]);
      return;
    }
    const team = teams.find((t) => t.id === teamId);
    if (!idA) {
      setIdA(teamId);
      loadStats(team, setStatsA, setLoadingA);
    } else if (!idB) {
      setIdB(teamId);
      loadStats(team, setStatsB, setLoadingB).then(() => {
        setTimeout(() => comparisonRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      });
    }
  }

  const teamA = teams.find((t) => t.id === idA);
  const teamB = teams.find((t) => t.id === idB);
  const showComparison = teamA && teamB && statsA.length > 0 && statsB.length > 0 && !loadingA && !loadingB;

  const step = !idA ? 1 : !idB ? 2 : 3;

  return (
    <div style={{
      minHeight: "100vh", background: "#060e1a", color: "#f1f5f9",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      padding: "32px 24px", maxWidth: 980, margin: "0 auto",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: "#f1f5f9" }}>
          Comparateur d'équipes
        </h1>
        <p style={{ margin: "6px 0 0", color: "#475569", fontSize: 14 }}>
          Clique sur deux équipes pour comparer leurs statistiques
        </p>
      </div>

      {loadingTeams ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3].map((i) => <Skeleton key={i} h={96} r={18} />)}
        </div>
      ) : teams.length < 2 ? (
        <div style={{
          background: "#0d1f35", border: "1px solid #1e3a5a",
          borderRadius: 18, padding: 32, color: "#64748b", textAlign: "center",
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚔</div>
          <p style={{ margin: 0, fontWeight: 600 }}>
            Il te faut au moins 2 équipes sauvegardées pour les comparer.
          </p>
        </div>
      ) : (
        <>
          {/* Step indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            {[
              { n: 1, label: "Choisir équipe A", done: !!idA, color: COLOR_A },
              { n: 2, label: "Choisir équipe B", done: !!idB, color: COLOR_B },
              { n: 3, label: "Résultats",         done: showComparison, color: "#34d399" },
            ].map((s, i) => (
              <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {i > 0 && <div style={{ width: 24, height: 1, background: "#1e3a5a" }} />}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: s.done ? s.color : step === s.n ? s.color + "33" : "#1e3a5a",
                    border: `2px solid ${s.done || step === s.n ? s.color : "#1e3a5a"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 800,
                    color: s.done ? (s.color === COLOR_A ? "#0a1120" : "#fff") : s.color,
                    transition: "all 0.3s",
                  }}>
                    {s.done ? "✓" : s.n}
                  </div>
                  <span style={{ fontSize: 12, color: step === s.n || s.done ? "#e2e8f0" : "#475569", fontWeight: 600 }}>
                    {s.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Team selection grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {teams.map((t) => (
              <SelectionCard
                key={t.id}
                team={t}
                roleA={t.id === idA}
                roleB={t.id === idB}
                onSelect={handleSelect}
              />
            ))}
          </div>

          {/* Deselect hint */}
          {(idA || idB) && (
            <p style={{ marginTop: 12, fontSize: 12, color: "#334155", textAlign: "center" }}>
              Clique sur une équipe sélectionnée pour la désélectionner
            </p>
          )}

          {/* Loading state */}
          {(loadingA || loadingB) && (
            <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
              <Skeleton h={120} r={20} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 1fr", gap: 10 }}>
                {[...Array(6)].map((_, i) => <Skeleton key={i} h={20} r={6} />)}
              </div>
            </div>
          )}

          {/* Comparison */}
          <div ref={comparisonRef}>
            {showComparison && (
              <ComparisonPanel
                teamA={teamA} teamB={teamB}
                statsA={statsA} statsB={statsB}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
