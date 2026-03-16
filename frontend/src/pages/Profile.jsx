import { useEffect, useMemo, useState } from "react";
import { getCurrentTeamId, getToken, setCurrentTeamId } from "../utils/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [teams, setTeams] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const token = getToken();

        const [profileResponse, teamsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/teams/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const profileData = await profileResponse.json();
        const teamsData = await teamsResponse.json();

        if (!profileResponse.ok || !teamsResponse.ok) {
          setMessage("Impossible de charger les données du profil.");
          return;
        }

        setProfile(profileData);
        setTeams(teamsData);
      } catch {
        setMessage("Erreur réseau pendant le chargement du profil.");
      }
    }

    loadProfile();
  }, []);

  const currentTeam = useMemo(() => {
    const currentId = Number(getCurrentTeamId());
    return teams.find((team) => team.id === currentId) || null;
  }, [teams]);

  function handleSetCurrentTeam(event) {
    const selectedTeamId = event.target.value;
    setCurrentTeamId(selectedTeamId);
    setMessage("Équipe actuelle mise à jour.");
  }

  if (!profile) {
    return <p>{message || "Chargement du profil..."}</p>;
  }

  return (
    <section className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Profil</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <article className="bg-slate-800 rounded-lg p-4">
          <h2 className="text-sm text-slate-300">Username</h2>
          <p className="text-xl font-semibold">{profile.username}</p>
        </article>
        <article className="bg-slate-800 rounded-lg p-4">
          <h2 className="text-sm text-slate-300">Nombre d&apos;équipes</h2>
          <p className="text-xl font-semibold">{teams.length}</p>
        </article>
        <article className="bg-slate-800 rounded-lg p-4">
          <h2 className="text-sm text-slate-300">Dernière équipe</h2>
          <p className="text-xl font-semibold">{profile.latestTeam?.name || "Aucune"}</p>
        </article>
      </div>

      <div className="bg-slate-800 rounded-lg p-4">
        <label className="block mb-2">Équipe actuelle</label>
        <select
          className="bg-slate-700 p-2 rounded w-full md:w-1/2"
          value={currentTeam?.id || ""}
          onChange={handleSetCurrentTeam}
        >
          <option value="">Aucune équipe sélectionnée</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
        {currentTeam && <p className="mt-3 text-emerald-300">Équipe active: {currentTeam.name}</p>}
      </div>

      {message && <p className="text-sm text-indigo-300">{message}</p>}
    </section>
  );
}
