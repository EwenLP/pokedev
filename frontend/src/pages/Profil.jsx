import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, logout, setToken } from '../utils/auth';
import { getFavorites, removeFavorite } from "../api/favoriteApi";
import { deleteTeam } from "../api/teamApi";
import { Icon } from '@iconify/react';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const AVATAR_KEY = "profile_avatar";

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    const savedAvatar = localStorage.getItem(AVATAR_KEY);
    if (savedAvatar) setAvatarUrl(savedAvatar);

    const handler = () => fetchUserData();
    window.addEventListener("favoritesUpdated", handler);
    return () => window.removeEventListener("favoritesUpdated", handler);
  }, []);

  const fetchUserData = async () => {
    const token = getToken();
    if (!token) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }
    try {
      const userRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!userRes.ok) { 
        handleLogout(); 
        return; 
      }

      const userData = await userRes.json();

      let favoritesData = [];

      try {
        favoritesData = await getFavorites();
      } catch (e) {
        console.warn("Erreur favoris :", e);
      }
      setUser({ ...userData, favoritesCount: favoritesData.length });
      setFavorites(favoritesData);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Erreur profil:', error);
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
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleProfileSave = async ({ newUsername, newAvatarUrl }) => {
    if (newAvatarUrl !== undefined) {
      if (newAvatarUrl) {
        localStorage.setItem(AVATAR_KEY, newAvatarUrl);
        setAvatarUrl(newAvatarUrl);
      } else {
        localStorage.removeItem(AVATAR_KEY);
        setAvatarUrl(null);
      }
    }

    if (newUsername && newUsername !== user?.username) {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/auth/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ username: newUsername }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la mise à jour.");
      }

      if (data.token) setToken(data.token);
      setUser(prev => ({ ...prev, username: data.user.username }));
    }
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
            favorites={favorites}
            formatDate={formatDate}
            onLogout={handleLogout}
            refreshData={fetchUserData}
            avatarUrl={avatarUrl}
            onProfileSave={handleProfileSave}
          />
        ) : (
          <LoggedOutView />
        )}
      </main>
    </div>
  );
}

// --- Modal d'édition du profil ---
function EditProfileModal({ user, avatarUrl, onSave, onClose }) {
  const [username, setUsername] = useState(user.username || '');
  const [previewUrl, setPreviewUrl] = useState(avatarUrl || null);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      await onSave({
        newUsername: username.trim() || user.username,
        newAvatarUrl: previewUrl,
      });
      onClose();
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAvatar = () => setPreviewUrl(null);

  const handleBackdropClick = (e) => {
    if (saving) return;
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#111c30] border border-gray-700 rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between mb-7">
          <h3 className="text-xl font-bold text-white">Modifier le profil</h3>
          <button
            onClick={onClose}
            disabled={saving}
            className="text-gray-500 hover:text-white transition-colors text-xl leading-none disabled:opacity-40"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col items-center mb-7">
          <div
            className={`relative w-24 h-24 rounded-full border-2 cursor-pointer transition-all ${
              dragOver ? 'border-cyan-400 scale-105' : 'border-gray-600 hover:border-cyan-600'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Avatar"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-cyan-900/50 flex items-center justify-center text-2xl font-bold text-cyan-400">
                {username.substring(0, 2).toUpperCase() || 'PK'}
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-2xl">📷</span>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />

          <div className="flex gap-3 mt-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Choisir une image
            </button>
            {previewUrl && (
              <>
                <span className="text-gray-600">·</span>
                <button
                  onClick={handleRemoveAvatar}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Supprimer
                </button>
              </>
            )}
          </div>
          <p className="text-gray-500 text-xs mt-1">PNG, JPG — Uniquement</p>
        </div>

        <div className="mb-5">
          <label className="block text-sm text-gray-400 mb-2">Nom d'utilisateur</label>
          <input
            type="text"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(null); }}
            maxLength={50}
            disabled={saving}
            className="w-full bg-[#0a1120] border border-gray-700 focus:border-cyan-400 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors placeholder-gray-600 disabled:opacity-60"
            placeholder="Ton pseudo"
          />
          <p className="text-gray-600 text-xs mt-1 text-right">{username.length}/50</p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 bg-red-900/30 border border-red-700 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors text-sm font-medium disabled:opacity-40"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                Enregistrement…
              </>
            ) : (
              'Enregistrer'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


// --- Vue connectée ---
function LoggedInView({ user, favorites, formatDate, onLogout, refreshData, avatarUrl, onProfileSave }) {
	const [searchTerm, setSearchTerm] = useState('');
	const [showSearch, setShowSearch] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const navigate = useNavigate();
 
	const handleDeleteTeam = async (teamId) => {
		if (window.confirm("Es-tu sûr de vouloir supprimer cette équipe ?")) {
			try {
				const res = await deleteTeam(teamId);
				if (res.ok) {
					refreshData();
				} else {
					alert("Erreur lors de la suppression de l'équipe.");
				}
			} catch (error) {
				console.error("Erreur suppression équipe:", error);
			}
		}
	};
 
	const handleEditTeam = (team) => {
		navigate(`/team?edit=${team.id}`, { state: { team } });
	};
 
	const handleDeleteFavorite = async (pokemonApiId) => {
		if (window.confirm("Retirer ce Pokémon de tes favoris ?")) {
			try {
				const res = await removeFavorite(pokemonApiId);
				if (res.ok) {
					refreshData();
				} else {
					alert("Erreur lors de la suppression du favori.");
				}
			} catch (error) {
				console.error("Erreur suppression favori:", error);
			}
		}
	};
 
	const filteredTeams = user.teams?.filter(team =>
		team.name.toLowerCase().includes(searchTerm.toLowerCase())
	) || [];
 
	const hasManyTeams = user.teams?.length > 3;
 
	const teamsToDisplay = searchTerm
		? filteredTeams
		: (user.teams?.slice(0, 3) || []);
 
	return (
		<div className="space-y-6">
			{showEditModal && (
				<EditProfileModal
					user={user}
					avatarUrl={avatarUrl}
					onSave={onProfileSave}
					onClose={() => setShowEditModal(false)}
				/>
			)}
 
			<div className="bg-[#111c30] border border-gray-800 rounded-2xl p-6 flex items-center justify-between">
				<div className="flex items-start gap-5">
					<div className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-cyan-700 overflow-hidden flex-shrink-0 mt-1">
						{avatarUrl ? (
							<img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
						) : (
							<div className="w-full h-full bg-cyan-900/50 flex items-center justify-center text-xl font-bold text-cyan-400">
								{user.username?.substring(0, 2).toUpperCase() || 'PK'}
							</div>
						)}
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
				<button
					onClick={() => setShowEditModal(true)}
					className="p-3 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-cyan-400"
					title="Modifier le profil"
				>
					✏️
				</button>
			</div>
 
			{/* Favoris */}
			<div className="bg-[#111c30] border border-gray-800 rounded-2xl p-6">
				<h4 className="text-lg font-semibold mb-5">Mes Favoris</h4>
 
				{favorites.length === 0 ? (
					<p className="text-gray-400 text-sm">
						Tu n'as pas encore de Pokémon favoris.
					</p>
				) : (
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
						{favorites.map((fav) => (
							<div
								key={fav.id}
								className="relative bg-slate-800 p-4 rounded-xl text-center"
							>
								<button
									onClick={() => handleDeleteFavorite(fav.pokemonApiId)}
									className="absolute top-2 right-2"
									title="Retirer des favoris"
								>
									<Icon
										icon={"ic:round-close"}
										className="w-6 h-6 text-[#61dafbaa] hover:text-red-400 hover:scale-125 transition-all"
									/>
								</button>
								<img
									src={fav.spriteUrl}
									alt={fav.pokemonName}
									className="w-20 mx-auto"
								/>
								<p className="mt-2 text-sm font-medium">
									{fav.pokemonName}
								</p>
							</div>
						))}
					</div>
				)}
			</div>
 
			{/* Équipes */}
			<div className="bg-[#111c30] border border-gray-800 rounded-2xl p-6">
				<div className="flex justify-between items-center mb-5">
					<h4 className="text-lg font-semibold">Mes Équipes</h4>
					{hasManyTeams && (
						<button
							onClick={() => setShowSearch(!showSearch)}
							className={`p-2 rounded-lg transition-colors ${
								showSearch
									? 'bg-cyan-900/40 text-cyan-400'
									: 'hover:bg-gray-800 text-gray-400'
							}`}
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
							className="w-full bg-[#0a1120] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400"
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
									<div className="flex items-center gap-3">
										<button
											onClick={() => handleEditTeam(team)}
											className="text-xs text-gray-400 hover:text-cyan-400 transition-colors"
											title="Modifier l'équipe"
										>
											✏️
										</button>
										<button
											onClick={() => handleDeleteTeam(team.id)}
											className="text-xs text-gray-400 hover:text-red-400 transition-colors"
											title="Supprimer l'équipe"
										>
											🗑️
										</button>
										<span className="text-xs text-gray-500 ml-2">
											{formatDate(team.createdAt)}
										</span>
									</div>
								</div>
 
								<div className="flex gap-2 overflow-x-auto pb-2">
									{team.teamPokemons.map((tp) => (
										<div
											key={tp.id}
											className="flex-shrink-0 bg-[#111c30] border border-gray-700 rounded-lg p-2 text-center w-20"
										>
											<img src={tp.spriteUrl} className="w-12 h-12 mx-auto" />
											<p className="text-[10px] truncate text-gray-300 capitalize">
												{tp.pokemonName}
											</p>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="text-gray-500 text-center py-4">
						{searchTerm
							? 'Aucune équipe trouvée.'
							: "Vous n'avez pas encore d'équipe."}
					</p>
				)}
			</div>
 
			{/* NAV */}
			<div className="space-y-3">
				<MenuLink title="Mon Équipe" href="/team" />
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
				<h3 className="text-xl font-semibold mb-2">Connectez-vous pour accéder à votre profil</h3>
				<p className="text-gray-400 mb-8 text-sm">Gérez vos informations et votre équipe Pokémon.</p>
				<a href="/login" className="bg-cyan-400 hover:bg-cyan-300 text-black font-bold py-3 px-8 rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
					<span>→</span> Se connecter
				</a>
			</div>
		</div>
	);
}
 
// --- Composants utilitaires ---
function MenuLink({ title, href }) {
	return (
		<a href={href} className="bg-[#111c30] border border-gray-800 rounded-xl p-4 flex justify-between items-center hover:bg-slate-800/50 transition-colors group">
			<span className="group-hover:text-cyan-400 transition-colors">{title}</span>
			<span className="text-gray-500 group-hover:translate-x-1 group-hover:text-cyan-400 transition-all">›</span>
		</a>
	);
}
