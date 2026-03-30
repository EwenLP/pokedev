import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [location]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="relative max-w-7xl mx-auto py-6 px-4 z-50">
      <div className="flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-cyan-400">
          PokéDex
        </Link>

        <button
          onClick={toggleMenu}
          className="md:hidden text-gray-400 hover:text-white focus:outline-none"
        >
          <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M18.278 16.864a1 1 0 01-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 01-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 011.414-1.414l4.829 4.828 4.828-4.828a1 1 0 111.414 1.414l-4.828 4.829 4.828 4.828z"
              />
            ) : (
              <path
                fillRule="evenodd"
                d="M4 5h16a1 1 0 010 2H4a1 1 0 110-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2z"
              />
            )}
          </svg>
        </button>

        <nav className="hidden md:flex gap-6 items-center text-gray-400">
          <NavLink to="/" active={isActive('/')}>
            Accueil
          </NavLink>

          <NavLink to="/pokedex" active={isActive('/pokedex')}>
            Pokédex
          </NavLink>

          <NavLink to="/team" active={isActive('/team')}>
            Mon Équipe
          </NavLink>

          <NavLink to="/profil" active={isActive('/profil')}>
            Profil
          </NavLink>

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
      </div>

      {isMenuOpen && (
        <nav className="md:hidden absolute left-4 right-4 mt-2 p-4 bg-[#0a1120] border border-cyan-900/50 rounded-xl shadow-2xl flex flex-col gap-4 text-gray-400">
          <NavLink to="/" active={isActive('/')}>
            Accueil
          </NavLink>

          <NavLink to="/pokedex" active={isActive('/pokedex')}>
            Pokédex
          </NavLink>

          <NavLink to="/team" active={isActive('/team')}>
            Mon Équipe
          </NavLink>

          <NavLink to="/profil" active={isActive('/profil')}>
            Profil
          </NavLink>

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-400 text-white font-semibold px-4 py-2 rounded-lg transition-colors w-fit"
            >
              <span>←</span>
              Déconnexion
            </button>
          ) : (
            <div className="flex flex-col gap-4">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors w-full"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold px-4 py-2 rounded-lg transition-colors w-full"
              >
                Inscription
              </Link>
            </div>
          )}
        </nav>
      )}
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
