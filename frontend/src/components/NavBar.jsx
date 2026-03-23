import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [location]);

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="flex justify-between items-center max-w-7xl mx-auto py-6 px-4">
      <Link to="/" className="text-2xl font-bold text-cyan-400">
        PokéDex
      </Link>

      <nav className="flex gap-6 items-center text-gray-400">
        <NavLink to="/" active={isActive('/')}>
          Accueil
        </NavLink>

        <NavLink to="/pokedex" active={isActive('/pokedex')}>
          Pokédex
        </NavLink>

        <NavLink to="/team" active={isActive('/team')}>
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
          Profil
        </Link>

        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-400 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <span>←</span>
            Déconnexion
          </button>
        ) : (
          <div className="flex gap-4">
            <Link
              to="/login"
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Connexion
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Inscription
            </Link>
          </div>
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
