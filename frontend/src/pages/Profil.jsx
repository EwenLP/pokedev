import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, logout } from '../utils/auth';
import { getFavorites } from "../api/favoriteApi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ProfilePage() {
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
const [favorites, setFavorites] = useState([]);
const navigate = useNavigate();

useEffect(() => {
	fetchUserData();
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

		setUser({
		...userData,
		favoritesCount: favoritesData.length
		});

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
				favorites={favorites}
				formatDate={formatDate}
				onLogout={handleLogout}
			/>
		) : (
			<LoggedOutView />
		)}
		</main>
	</div>
);
}

// --- Vue connectée ---
function LoggedInView({ user, favorites, formatDate, onLogout }) {
const [searchTerm, setSearchTerm] = useState('');
const [showSearch, setShowSearch] = useState(false);

const filteredTeams = user.teams?.filter(team =>
	team.name.toLowerCase().includes(searchTerm.toLowerCase())
) || [];

const hasManyTeams = user.teams?.length > 3;

const teamsToDisplay = searchTerm
	? filteredTeams
	: (user.teams?.slice(0, 3) || []);

return (
	<div className="space-y-6">
	<div className="bg-[#111c30] border border-gray-800 rounded-2xl p-6 flex items-center justify-between">
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
		<button className="p-3 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
		✏️
		</button>
	</div>

	<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
		<StatCard label="Pokémon vus" value={user.favoritesCount || 0} />
		<StatCard label="Équipes" value={user.teamsCount || 0} />
		<StatCard label="Type favori" value={user.favoriteType || 'Aucun'} isText />
	</div>

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
				className="bg-slate-800 p-4 rounded-xl text-center hover:scale-105 transition"
			>
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
				<span className="text-xs text-gray-500">
					{formatDate(team.createdAt)}
				</span>
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

function BadgeCard({ title, icon, obtained }) {
	return (
		<div className={`border rounded-xl p-5 text-center transition-all ${obtained ? 'border-cyan-800 bg-cyan-900/20' : 'border-gray-800 opacity-40 grayscale'}`}>
			<div className="text-2xl mb-2">{obtained ? icon : '🔒'}</div>
			<p className="text-sm font-medium mb-3">{title}</p>
			{obtained && <span className="text-xs bg-cyan-500 text-black px-3 py-1 rounded-full font-bold">Obtenu</span>}
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
