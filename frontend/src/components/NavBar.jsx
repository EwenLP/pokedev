import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [location]);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="flex justify-between items-center max-w-7xl mx-auto py-6 px-4">
      <Link to="/" className="text-2xl font-bold text-cyan-400">
        PokéDex
      </Link>

      <nav className="flex gap-6 items-center text-gray-400">
        <NavLink to="/" active={isActive('/')}>
          <span className="mr-2">🏠</span>
          Accueil
        </NavLink>

        <NavLink to="/pokedex" active={isActive('/pokedex')}>
          <span className="mr-2">📖</span>
          Pokédex
        </NavLink>

        <NavLink to="/team" active={isActive('/team')}>
          <span className="mr-2">👥</span>
          Mon Équipe
        </NavLink>

        <Link
          to="/profil"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            isActive('/profil')
              ? 'bg-cyan-900/30 text-cyan-400 border-cyan-800'
              : 'border-transparent hover:text-white'
          }`}
        >
          <span>👤</span>
          Profil
        </Link>

        {isLoggedIn ? (
          <span className="bg-cyan-900/30 text-cyan-400 px-4 py-2 rounded-lg border border-cyan-800 cursor-default">
            Connecté
          </span>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <span>→</span>
            Connexion
          </Link>
        )}
      </nav>
    </header>
  );
}

function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`flex items-center transition-colors ${
        active ? 'text-white' : 'hover:text-white'
      }`}
    >
      {children}
    </Link>
  );
}
