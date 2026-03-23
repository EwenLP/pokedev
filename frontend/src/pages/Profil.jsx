import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, logout } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = getToken();
    if (!token) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setIsLoggedIn(true);
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setUser(null);
    navigate('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1120]">
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white font-sans">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-4xl font-bold text-cyan-400 mb-10">Mon Profil</h2>
        {isLoggedIn && user ? (
          <LoggedInView
            user={user}
            formatDate={formatDate}
            onLogout={handleLogout}
            refreshData={fetchUserData}
          />
        ) : (
          <LoggedOutView />
        )}
      </main>
    </div>
  );
}

// --- Vue connectée ---
function LoggedInView({ user, formatDate, onLogout, refreshData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: user.username || '',
    email: user.email || ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          localStorage.setItem('token', data.token); 
        }
        
        setIsEditing(false);
        refreshData(); 
      } else {
        alert(data.message || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const filteredTeams = user.teams?.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const hasManyTeams = user.teams?.length > 3;
  const teamsToDisplay = searchTerm ? filteredTeams : (user.teams?.slice(0, 3) || []);

  return (
    <div className="space-y-6">
      {/* SECTION INFOS (Avec mode édition) */}
      <div className="bg-[#111c30] border border-gray-800 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-lg font-semibold">Informations du compte</h4>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`p-2 rounded-lg transition-colors ${isEditing ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            {isEditing ? 'Annuler' : '✏️ Modifier'}
          </button>
        </div>

        {!isEditing ? (
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-cyan-900/50 rounded-full flex items-center justify-center text-xl font-bold text-cyan-400 border-2 border-cyan-700">
              {user.username?.substring(0, 2).toUpperCase() || 'PK'}
            </div>
            <div>
              <h3 className="text-xl font-bold">{user.username}</h3>
              <p className="text-gray-400 text-sm flex items-center gap-2">
                <span>✉️</span> {user.email}
              </p>
              <p className="text-gray-500 text-sm flex items-center gap-2">
                <span>📅</span> Membre depuis le {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Pseudo</label>
                <input 
                  type="text" 
                  value={editForm.username}
                  onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                  className="w-full bg-[#0a1120] border border-gray-700 rounded-xl px-4 py-2 focus:border-cyan-400 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Email</label>
                <input 
                  type="email" 
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="w-full bg-[#0a1120] border border-gray-700 rounded-xl px-4 py-2 focus:border-cyan-400 outline-none transition-colors"
                />
              </div>
            </div>
            <button type="submit" className="bg-cyan-400 hover:bg-cyan-300 text-black font-bold py-2 px-6 rounded-lg transition-all">
              Sauvegarder
            </button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Pokémon vus" value={user.favoritesCount || 0} />
        <StatCard label="Équipes" value={user.teamsCount || 0} />
        <StatCard label="Type favori" value={user.favoriteType || 'Aucun'} isText />
      </div>

      {/* SECTION MES ÉQUIPES */}
      <div className="bg-[#111c30] border border-gray-800 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-5">
          <h4 className="text-lg font-semibold">Mes Équipes</h4>
          {hasManyTeams && (
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2 rounded-lg transition-colors ${showSearch ? 'bg-cyan-900/40 text-cyan-400' : 'hover:bg-gray-800 text-gray-400'}`}
            >
              🔍
            </button>
          )}
        </div>

        {showSearch && hasManyTeams && (
          <div className="mb-6">
            <input
              type="text"
              placeholder="Rechercher une équipe..."
              className="w-full bg-[#0a1120] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        {teamsToDisplay.length > 0 ? (
          <div className="space-y-4">
            {teamsToDisplay.map((team) => (
              <div key={team.id} className="bg-[#0a1120] border border-gray-800 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-bold text-cyan-400">{team.name}</h5>
                  <span className="text-xs text-gray-500">{formatDate(team.createdAt)}</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {team.teamPokemons.map((tp) => (
                    <div key={tp.id} className="flex-shrink-0 bg-[#111c30] border border-gray-700 rounded-lg p-2 text-center w-20">
                      <img src={tp.spriteUrl} alt={tp.pokemonName} className="w-12 h-12 mx-auto" />
                      <p className="text-[10px] truncate text-gray-300 capitalize">{tp.pokemonName}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            {searchTerm ? 'Aucune équipe trouvée.' : "Pas encore d'équipe."}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <MenuLink title="Accéder au Team Builder" href="/team" />
        <button 
          onClick={onLogout}
          className="w-full bg-red-900/10 border border-red-900/30 text-red-400 rounded-xl p-4 text-left hover:bg-red-900/20 transition-colors"
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
}

// --- Vue déconnectée ---
function LoggedOutView() {
  return (
    <div className="flex justify-center">
      <div className="bg-[#111c30] border border-gray-800 rounded-2xl p-12 flex flex-col items-center text-center max-w-md">
        <div className="bg-cyan-900/30 w-20 h-20 rounded-2xl mb-6 flex items-center justify-center border border-cyan-800">
          <span className="text-4xl text-cyan-400">👤</span>
        </div>
        <h3 className="text-xl font-semibold mb-2">Session expirée</h3>
        <p className="text-gray-400 mb-8 text-sm">Veuillez vous reconnecter pour accéder à votre espace.</p>
        <a href="/login" className="bg-cyan-400 hover:bg-cyan-300 text-black font-bold py-3 px-8 rounded-lg transition-all">
          Se connecter
        </a>
      </div>
    </div>
  );
}

// --- Composants utilitaires ---
function StatCard({ label, value, isText = false }) {
  return (
    <div className="bg-[#111c30] border border-gray-800 rounded-2xl p-5 text-center">
      <p className={`text-2xl font-bold ${isText ? 'text-cyan-400' : 'text-white'}`}>
        {value}
      </p>
      <p className="text-gray-400 text-sm mt-1">{label}</p>
      {!isText && (
        <div className="h-1 w-full bg-gray-800 mt-4 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-400 transition-all duration-500"
            style={{ width: `${Math.min((value / 151) * 100, 100)}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}

function MenuLink({ title, href }) {
  return (
    <a href={href} className="bg-[#111c30] border border-gray-800 rounded-xl p-4 flex justify-between items-center hover:bg-slate-800/50 transition-colors group">
      <span className="group-hover:text-cyan-400 transition-colors">{title}</span>
      <span className="text-gray-500 group-hover:translate-x-1 group-hover:text-cyan-400 transition-all">›</span>
    </a>
  );
}